import assert from "node:assert/strict";
import { test } from "node:test";
import {
  getBase58Encoder,
  getSolanaErrorFromJsonRpcError,
  getSolanaErrorFromTransactionError,
  SolanaError,
  SOLANA_ERROR__TRANSACTION__SIGNATURES_MISSING,
} from "@solana/kit";
import {
  WalletStandardError,
  WALLET_STANDARD_ERROR__USER__REQUEST_REJECTED,
} from "@wallet-standard/errors";
import { getTransactionErrorMessage } from "../src/lib/transactionError";

const errorCases: Array<[string | Record<string, unknown>, RegExp]> = [
  ["AccountNotFound", /Not enough SOL/],
  ["InsufficientFundsForFee", /Not enough SOL/],
  [{ InsufficientFundsForRent: { account_index: 0 } }, /Not enough SOL to create/],
  [{ InstructionError: [0, "InsufficientFunds"] }, /Insufficient funds/],
  [{ InstructionError: [1, { Custom: 6001 }] }, /program error 6001, instruction 2/],
  ["BlockhashNotFound", /transaction has expired/],
  ["UnknownTransactionFailure", /contact support with Solana error code \d+/],
];

for (const [transactionError, expected] of errorCases) {
  test(`shows readable transaction error ${JSON.stringify(transactionError)} in ${process.env.NODE_ENV}`, () => {
    const error = getSolanaErrorFromTransactionError(transactionError);
    if (process.env.NODE_ENV === "production") {
      // Verify that the test really exercises the SDK's stripped-message branch.
      assert.match(error.message, /Solana error #/);
      assert.match(error.message, /Decode this error/);
    }
    const message = getTransactionErrorMessage(error);
    assert.match(message, expected);
    assert.doesNotMatch(message, /Decode this error|npx|Solana error #/);
  });

  test(`unwraps preflight error ${JSON.stringify(transactionError)}`, () => {
    const error = getSolanaErrorFromJsonRpcError({
      code: -32002,
      message: "Transaction simulation failed",
      data: { err: transactionError, logs: [], unitsConsumed: 0 },
    });
    assert.match(getTransactionErrorMessage(error), expected);
  });
}

test("describes missing wallet signatures without Kit's production message table", () => {
  const error = new SolanaError(SOLANA_ERROR__TRANSACTION__SIGNATURES_MISSING, {
    addresses: ["11111111111111111111111111111111"],
  });
  assert.match(getTransactionErrorMessage(error), /wallet returned a transaction with missing signatures/);
});

test("describes malformed base58 data without the SDK message", () => {
  assert.throws(
    () => getBase58Encoder().encode("!invalid!"),
    (error) => /transaction data is invalid/.test(getTransactionErrorMessage(error))
  );
});

test("maps wallet rejection codes to cancellation copy", () => {
  const errors = [
    new WalletStandardError(WALLET_STANDARD_ERROR__USER__REQUEST_REJECTED),
    Object.assign(new Error("Provider failure"), { code: 4001 }),
    { code: 4001, message: "User rejected" },
  ];
  for (const error of errors) {
    assert.equal(getTransactionErrorMessage(error), "Transaction cancelled in your wallet.");
  }
});

test("preserves the app's timeout message and pending signature", () => {
  const error = new Error("Transaction submitted but confirmation timed out. Check the submitted signature before trying again.");
  assert.equal(getTransactionErrorMessage(error), error.message);
});
