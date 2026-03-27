const TURSO_URL = process.env.TURSO_DATABASE_URL!.replace("libsql://", "https://");
const TURSO_TOKEN = process.env.TURSO_AUTH_TOKEN!;

interface TursoResult {
  columns: string[];
  rows: unknown[][];
}

export async function tursoExecute(
  sql: string,
  args: (string | number | null)[] = []
): Promise<TursoResult> {
  const res = await fetch(`${TURSO_URL}/v2/pipeline`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${TURSO_TOKEN}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      requests: [
        { type: "execute", stmt: { sql, args: args.map((a) => ({ type: typeof a === "number" ? "integer" : a === null ? "null" : "text", value: a === null ? undefined : String(a) })) } },
        { type: "close" },
      ],
    }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Turso error ${res.status}: ${text}`);
  }

  const json = await res.json();
  const result = json.results?.[0]?.response?.result;
  if (!result) return { columns: [], rows: [] };

  return {
    columns: result.cols?.map((c: { name: string }) => c.name) ?? [],
    rows: result.rows?.map((r: { value: unknown }[]) => r.map((cell) => cell.value)) ?? [],
  };
}

export async function tursoBatch(
  statements: { sql: string; args: (string | number | null)[] }[]
): Promise<TursoResult[]> {
  const requests = [
    ...statements.map((s) => ({
      type: "execute" as const,
      stmt: {
        sql: s.sql,
        args: s.args.map((a) => ({
          type: typeof a === "number" ? "integer" : a === null ? "null" : "text",
          value: a === null ? undefined : String(a),
        })),
      },
    })),
    { type: "close" as const },
  ];

  const res = await fetch(`${TURSO_URL}/v2/pipeline`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${TURSO_TOKEN}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ requests }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Turso error ${res.status}: ${text}`);
  }

  const json = await res.json();
  return json.results
    .filter((_: unknown, i: number) => i < statements.length)
    .map((r: { response?: { result?: { cols?: { name: string }[]; rows?: { value: unknown }[][] } } }) => {
      const result = r.response?.result;
      if (!result) return { columns: [], rows: [] };
      return {
        columns: result.cols?.map((c) => c.name) ?? [],
        rows: result.rows?.map((row) => row.map((cell) => cell.value)) ?? [],
      };
    });
}
