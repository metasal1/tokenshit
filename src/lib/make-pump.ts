import {
  ComputeBudgetProgram,
  Keypair,
  PublicKey,
  Transaction,
  type Connection,
} from "@solana/web3.js";
import {
  ASSOCIATED_TOKEN_PROGRAM_ID,
  NATIVE_MINT,
  TOKEN_2022_PROGRAM_ID,
  createAssociatedTokenAccountIdempotentInstruction,
  createTransferCheckedInstruction,
  getAssociatedTokenAddressSync,
} from "@solana/spl-token";
import {
  OnlinePumpSdk,
  PumpSdk,
  getBuyTokenAmountFromSolAmount,
} from "@pump-fun/pump-sdk";
import { BN } from "@coral-xyz/anchor";
import bs58 from "bs58";
import { withSolanaConnection } from "@/lib/treasury";
import { MAKE_FIRST_BUY_USD, MAKE_PAYER } from "@/lib/make-token";

function payerKeypair(): Keypair {
  const raw = process.env.MAKE_PAYER_SECRET || "";
  if (!raw) throw new Error("MAKE_PAYER_SECRET missing");
  const parsed = JSON.parse(raw) as number[];
  if (!Array.isArray(parsed) || parsed.length < 32) {
    throw new Error("MAKE_PAYER_SECRET bad");
  }
  const kp = Keypair.fromSecretKey(Uint8Array.from(parsed));
  if (kp.publicKey.toBase58() !== MAKE_PAYER) {
    throw new Error("MAKE_PAYER_SECRET mismatch");
  }
  return kp;
}

function mintFromRow(privateKey: string, secretJson: string | null): Keypair {
  if (secretJson) {
    const arr = JSON.parse(secretJson) as number[];
    if (Array.isArray(arr) && arr.length >= 32) {
      return Keypair.fromSecretKey(Uint8Array.from(arr));
    }
  }
  return Keypair.fromSecretKey(bs58.decode(privateKey));
}

async function solLamportsForUsd(usd: number): Promise<number> {
  try {
    const res = await fetch(
      "https://lite-api.jup.ag/price/v2?ids=So11111111111111111111111111111111111111112",
      { cache: "no-store" }
    );
    const json = (await res.json()) as {
      data?: { So11111111111111111111111111111111111111112?: { price?: string } };
    };
    const px = Number(
      json.data?.So11111111111111111111111111111111111111112?.price || 0
    );
    if (px > 0) return Math.ceil((usd / px) * 1e9);
  } catch {
    /* fallback */
  }
  return Math.ceil(usd * 0.008 * 1e9);
}

async function metadataUri(opts: {
  name: string;
  symbol: string;
  description: string;
  twitter: string;
  telegram: string;
  website: string;
  imageUrl: string;
  imageData: string;
}): Promise<string> {
  let file: Blob;
  if (opts.imageData.startsWith("data:image/")) {
    const m = opts.imageData.match(/^data:(image\/[a-zA-Z0-9.+-]+);base64,(.+)$/);
    if (!m) throw new Error("bad image data");
    const bin = Uint8Array.from(atob(m[2]!), (c) => c.charCodeAt(0));
    file = new Blob([bin], { type: m[1] });
  } else if (opts.imageUrl.startsWith("https://")) {
    const img = await fetch(opts.imageUrl, { cache: "no-store" });
    if (!img.ok) throw new Error("image fetch failed");
    file = await img.blob();
  } else {
    throw new Error("need image");
  }
  const form = new FormData();
  form.append("file", file, "image.png");
  form.append("name", opts.name);
  form.append("symbol", opts.symbol);
  form.append("description", opts.description || opts.name);
  form.append("twitter", opts.twitter);
  form.append("telegram", opts.telegram);
  form.append("website", opts.website);
  form.append("showName", "true");
  const res = await fetch("https://pump.fun/api/ipfs", {
    method: "POST",
    body: form,
  });
  if (!res.ok) throw new Error(`ipfs ${res.status}`);
  const json = (await res.json()) as { metadataUri?: string; metadata?: { image?: string } };
  const uri = json.metadataUri;
  if (!uri) throw new Error("ipfs no uri");
  return uri;
}

export async function pumpCreateAndFirstBuy(opts: {
  name: string;
  symbol: string;
  description: string;
  twitter: string;
  telegram: string;
  website: string;
  imageUrl: string;
  imageData: string;
  receive: string;
  mintPrivateKey: string;
  mintSecretJson: string | null;
}): Promise<{ mint: string; sig: string; buySig: string | null }> {
  const payer = payerKeypair();
  const mintKp = mintFromRow(opts.mintPrivateKey, opts.mintSecretJson);
  const receivePk = new PublicKey(opts.receive);
  const uri = await metadataUri(opts);
  const lamports = await solLamportsForUsd(MAKE_FIRST_BUY_USD);
  const solAmount = new BN(lamports);

  return withSolanaConnection(async (conn: Connection) => {
    const online = new OnlinePumpSdk(conn);
    const pump = new PumpSdk();
    const [global, feeConfig, quoteControl] = await Promise.all([
      online.fetchGlobal(),
      online.fetchFeeConfig(),
      online.fetchQuoteControl(),
    ]);
    const amount = getBuyTokenAmountFromSolAmount({
      global,
      feeConfig,
      mintSupply: null,
      bondingCurve: null,
      amount: solAmount,
      quoteMint: NATIVE_MINT,
      quoteControl,
    });
    const createIxs = await pump.createV2AndBuyInstructions({
      global,
      mint: mintKp.publicKey,
      name: opts.name,
      symbol: opts.symbol,
      uri,
      creator: receivePk,
      user: payer.publicKey,
      amount,
      solAmount,
      mayhemMode: false,
    });
    const tx = new Transaction().add(
      ComputeBudgetProgram.setComputeUnitLimit({ units: 400_000 }),
      ComputeBudgetProgram.setComputeUnitPrice({ microLamports: 50_000 }),
      ...createIxs
    );
    const latest = await conn.getLatestBlockhash("confirmed");
    tx.feePayer = payer.publicKey;
    tx.recentBlockhash = latest.blockhash;
    tx.sign(payer, mintKp);
    const sig = await conn.sendRawTransaction(tx.serialize(), {
      skipPreflight: false,
      maxRetries: 3,
    });
    await conn.confirmTransaction(
      { signature: sig, blockhash: latest.blockhash, lastValidBlockHeight: latest.lastValidBlockHeight },
      "confirmed"
    );

    let buySig: string | null = null;
    if (receivePk.toBase58() !== payer.publicKey.toBase58() && amount.gtn(0)) {
      const src = getAssociatedTokenAddressSync(
        mintKp.publicKey,
        payer.publicKey,
        false,
        TOKEN_2022_PROGRAM_ID
      );
      const dest = getAssociatedTokenAddressSync(
        mintKp.publicKey,
        receivePk,
        false,
        TOKEN_2022_PROGRAM_ID
      );
      const tx2 = new Transaction().add(
        ComputeBudgetProgram.setComputeUnitLimit({ units: 80_000 }),
        createAssociatedTokenAccountIdempotentInstruction(
          payer.publicKey,
          dest,
          receivePk,
          mintKp.publicKey,
          TOKEN_2022_PROGRAM_ID,
          ASSOCIATED_TOKEN_PROGRAM_ID
        ),
        createTransferCheckedInstruction(
          src,
          mintKp.publicKey,
          dest,
          payer.publicKey,
          BigInt(amount.toString()),
          6,
          [],
          TOKEN_2022_PROGRAM_ID
        )
      );
      const latest2 = await conn.getLatestBlockhash("confirmed");
      tx2.feePayer = payer.publicKey;
      tx2.recentBlockhash = latest2.blockhash;
      tx2.sign(payer);
      buySig = await conn.sendRawTransaction(tx2.serialize(), { maxRetries: 3 });
      await conn.confirmTransaction(
        {
          signature: buySig,
          blockhash: latest2.blockhash,
          lastValidBlockHeight: latest2.lastValidBlockHeight,
        },
        "confirmed"
      );
    }
    return { mint: mintKp.publicKey.toBase58(), sig, buySig };
  });
}
