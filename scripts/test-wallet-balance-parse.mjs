import { test } from "node:test";
import assert from "node:assert/strict";
import {
  parseWalletBalances,
  parseShitBalance,
  referralClaimLocked,
} from "../src/lib/wallet-balance-parse.ts";

test("parseWalletBalances keeps last-good on error / rate-limit JSON", () => {
  assert.equal(parseWalletBalances({ error: "Rate limit — try again later" }), null);
  assert.equal(parseWalletBalances({ error: "RPC fail", code: "rate_limit" }), null);
  assert.equal(parseWalletBalances({}), null);
  assert.equal(parseWalletBalances(null), null);
});

test("parseWalletBalances accepts finite sol/usdc/shit", () => {
  assert.deepEqual(parseWalletBalances({ sol: 0.1, usdc: 2, shit: 1500 }), {
    sol: 0.1,
    usdc: 2,
    shit: 1500,
  });
  assert.deepEqual(parseWalletBalances({ sol: 0, usdc: 0, tokenshit: 99 }), {
    sol: 0,
    usdc: 0,
    shit: 99,
  });
});

test("parseShitBalance does not treat error JSON as 0", () => {
  assert.equal(parseShitBalance({ error: "boom" }), null);
  assert.equal(parseShitBalance({}), null);
  assert.equal(parseShitBalance({ balance: 1234.5 }), 1234.5);
  assert.equal(parseShitBalance({ balance: "1234" }), null);
});

test("referralClaimLocked: missing token (detail:false) does not disable claim", () => {
  assert.equal(
    referralClaimLocked({ wallet: "Abc", unpaidCount: 0, detail: false }),
    false
  );
  assert.equal(
    referralClaimLocked({ wallet: "Abc", unpaidCount: 0, detail: true }),
    true
  );
  assert.equal(
    referralClaimLocked({ wallet: "Abc", unpaidCount: 3, detail: true }),
    false
  );
  assert.equal(referralClaimLocked({ wallet: null, unpaidCount: 3 }), true);
});
