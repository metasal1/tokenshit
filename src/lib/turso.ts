const TURSO_URL = (process.env.TURSO_DATABASE_URL || "").replace(
  "libsql://",
  "https://"
);
const TURSO_TOKEN = process.env.TURSO_AUTH_TOKEN || "";

function ensureConfigured() {
  if (!TURSO_URL || !TURSO_TOKEN) {
    throw new Error("Turso not configured (missing env vars)");
  }
}

interface TursoResult {
  columns: string[];
  rows: unknown[][];
}

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

function isRetryableStatus(status: number) {
  return status === 429 || status === 502 || status === 503 || status === 504;
}

function isRetryableMessage(msg: string) {
  return /load-shed|429|503|timeout|ECONNRESET|fetch failed|temporar/i.test(
    msg
  );
}

async function pipelineFetch(
  body: unknown,
  attempt = 0
): Promise<Response> {
  ensureConfigured();
  const res = await fetch(`${TURSO_URL}/v2/pipeline`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${TURSO_TOKEN}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  if (!res.ok && isRetryableStatus(res.status) && attempt < 4) {
    // 200ms, 500ms, 1200ms, 2500ms
    const delay = Math.min(2500, 200 * Math.pow(2.2, attempt) + Math.random() * 100);
    await sleep(delay);
    return pipelineFetch(body, attempt + 1);
  }
  return res;
}

function mapArgs(args: (string | number | null)[]) {
  return args.map((a) => ({
    type:
      typeof a === "number" ? "integer" : a === null ? "null" : "text",
    value: a === null ? undefined : String(a),
  }));
}

export async function tursoExecute(
  sql: string,
  args: (string | number | null)[] = []
): Promise<TursoResult> {
  let lastErr: Error | null = null;

  for (let attempt = 0; attempt < 5; attempt++) {
    try {
      const res = await pipelineFetch({
        requests: [
          {
            type: "execute",
            stmt: { sql, args: mapArgs(args) },
          },
          { type: "close" },
        ],
      });

      if (!res.ok) {
        const text = await res.text();
        const err = new Error(`Turso error ${res.status}: ${text}`);
        if (isRetryableStatus(res.status) || isRetryableMessage(text)) {
          lastErr = err;
          await sleep(Math.min(2500, 200 * Math.pow(2, attempt)));
          continue;
        }
        throw err;
      }

      const json = await res.json();
      const first = json.results?.[0];
      if (first?.type === "error") {
        const msg = first.error?.message || "unknown";
        // unique constraint is not retryable
        if (/UNIQUE/i.test(msg)) {
          throw new Error(`Turso SQL error: ${msg}`);
        }
        if (isRetryableMessage(msg) && attempt < 4) {
          lastErr = new Error(`Turso SQL error: ${msg}`);
          await sleep(Math.min(2500, 200 * Math.pow(2, attempt)));
          continue;
        }
        throw new Error(`Turso SQL error: ${msg}`);
      }
      const result = first?.response?.result;
      if (!result) return { columns: [], rows: [] };

      return {
        columns: result.cols?.map((c: { name: string }) => c.name) ?? [],
        rows:
          result.rows?.map((r: { value: unknown }[]) =>
            r.map((cell) => cell.value)
          ) ?? [],
      };
    } catch (e) {
      const err = e instanceof Error ? e : new Error(String(e));
      if (isRetryableMessage(err.message) && attempt < 4) {
        lastErr = err;
        await sleep(Math.min(2500, 200 * Math.pow(2, attempt)));
        continue;
      }
      throw err;
    }
  }

  throw lastErr || new Error("Turso unavailable after retries");
}

export async function tursoBatch(
  statements: { sql: string; args: (string | number | null)[] }[]
): Promise<TursoResult[]> {
  const requests = [
    ...statements.map((s) => ({
      type: "execute" as const,
      stmt: {
        sql: s.sql,
        args: mapArgs(s.args),
      },
    })),
    { type: "close" as const },
  ];

  let lastErr: Error | null = null;
  for (let attempt = 0; attempt < 5; attempt++) {
    try {
      const res = await pipelineFetch({ requests });
      if (!res.ok) {
        const text = await res.text();
        const err = new Error(`Turso error ${res.status}: ${text}`);
        if (isRetryableStatus(res.status) || isRetryableMessage(text)) {
          lastErr = err;
          await sleep(Math.min(2500, 200 * Math.pow(2, attempt)));
          continue;
        }
        throw err;
      }

      const json = await res.json();
      return json.results
        .filter((_: unknown, i: number) => i < statements.length)
        .map(
          (r: {
            type?: string;
            error?: { message?: string };
            response?: {
              result?: {
                cols?: { name: string }[];
                rows?: { value: unknown }[][];
              };
            };
          }) => {
            if (r.type === "error") {
              throw new Error(
                `Turso SQL error: ${r.error?.message || "unknown"}`
              );
            }
            const result = r.response?.result;
            if (!result) return { columns: [], rows: [] };
            return {
              columns: result.cols?.map((c) => c.name) ?? [],
              rows:
                result.rows?.map((row) => row.map((cell) => cell.value)) ??
                [],
            };
          }
        );
    } catch (e) {
      const err = e instanceof Error ? e : new Error(String(e));
      if (isRetryableMessage(err.message) && attempt < 4) {
        lastErr = err;
        await sleep(Math.min(2500, 200 * Math.pow(2, attempt)));
        continue;
      }
      throw err;
    }
  }
  throw lastErr || new Error("Turso batch unavailable after retries");
}
