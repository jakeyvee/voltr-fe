import {
  isSolanaError,
  SOLANA_ERROR__CODECS__CANNOT_DECODE_EMPTY_BYTE_ARRAY,
  SOLANA_ERROR__CODECS__INVALID_BYTE_LENGTH,
  SOLANA_ERROR__CODECS__INVALID_STRING_FOR_BASE,
  SOLANA_ERROR__CODECS__OFFSET_OUT_OF_RANGE,
  SOLANA_ERROR__INSTRUCTION_ERROR__CUSTOM,
  SOLANA_ERROR__INSTRUCTION_ERROR__INSUFFICIENT_FUNDS,
  SOLANA_ERROR__JSON_RPC__SERVER_ERROR_SEND_TRANSACTION_PREFLIGHT_FAILURE,
  SOLANA_ERROR__RPC__TRANSPORT_HTTP_ERROR,
  SOLANA_ERROR__TRANSACTION__EXCEEDS_SIZE_LIMIT,
  SOLANA_ERROR__TRANSACTION__MALFORMED_MESSAGE_BYTES,
  SOLANA_ERROR__TRANSACTION__SIGNATURES_MISSING,
  SOLANA_ERROR__TRANSACTION__SIGNATURE_COUNT_TOO_HIGH_FOR_TRANSACTION_BYTES,
  SOLANA_ERROR__TRANSACTION_ERROR__ACCOUNT_NOT_FOUND,
  SOLANA_ERROR__TRANSACTION_ERROR__BLOCKHASH_NOT_FOUND,
  SOLANA_ERROR__TRANSACTION_ERROR__INSUFFICIENT_FUNDS_FOR_FEE,
  SOLANA_ERROR__TRANSACTION_ERROR__INSUFFICIENT_FUNDS_FOR_RENT,
} from "@solana/kit";
import {
  isWalletStandardError,
  WALLET_STANDARD_ERROR__USER__REQUEST_REJECTED,
} from "@wallet-standard/errors";

export function getTransactionErrorMessage(error: unknown): string {
  // Kit strips its message table from production builds. Branch on stable codes,
  // including the transaction error nested inside a preflight failure.
  if (isSolanaError(error, SOLANA_ERROR__JSON_RPC__SERVER_ERROR_SEND_TRANSACTION_PREFLIGHT_FAILURE)) {
    if (isSolanaError(error.cause)) return getTransactionErrorMessage(error.cause);
    return "The transaction failed its preflight checks. Please refresh and try again.";
  }
  if (
    isSolanaError(error, SOLANA_ERROR__TRANSACTION_ERROR__ACCOUNT_NOT_FOUND) ||
    isSolanaError(error, SOLANA_ERROR__TRANSACTION_ERROR__INSUFFICIENT_FUNDS_FOR_FEE)
  ) {
    return "Not enough SOL to pay for this transaction. Add SOL to your wallet and try again.";
  }
  if (isSolanaError(error, SOLANA_ERROR__TRANSACTION_ERROR__INSUFFICIENT_FUNDS_FOR_RENT)) {
    return "Not enough SOL to create the required accounts. Add SOL to your wallet and try again.";
  }
  if (isSolanaError(error, SOLANA_ERROR__INSTRUCTION_ERROR__INSUFFICIENT_FUNDS)) {
    return "Insufficient funds for this transaction. Check your token and SOL balances.";
  }
  if (isSolanaError(error, SOLANA_ERROR__INSTRUCTION_ERROR__CUSTOM)) {
    // Custom codes are program-specific; interpreting them without the program
    // identity could mislabel an error from a nested instruction.
    return `The program rejected this transaction (program error ${error.context.code}, instruction ${error.context.index + 1}). Please refresh and check the transaction details.`;
  }
  if (isSolanaError(error, SOLANA_ERROR__TRANSACTION__EXCEEDS_SIZE_LIMIT)) {
    return `This transaction exceeds the ${error.context.transactionSizeLimit}-byte size limit. Please contact support.`;
  }
  if (isSolanaError(error, SOLANA_ERROR__TRANSACTION__SIGNATURES_MISSING)) {
    return "The wallet returned a transaction with missing signatures. Reconnect your wallet and try again.";
  }
  if (
    isSolanaError(error, SOLANA_ERROR__TRANSACTION__MALFORMED_MESSAGE_BYTES) ||
    isSolanaError(error, SOLANA_ERROR__CODECS__INVALID_STRING_FOR_BASE) ||
    isSolanaError(error, SOLANA_ERROR__CODECS__INVALID_BYTE_LENGTH) ||
    isSolanaError(error, SOLANA_ERROR__CODECS__OFFSET_OUT_OF_RANGE) ||
    isSolanaError(error, SOLANA_ERROR__TRANSACTION__SIGNATURE_COUNT_TOO_HIGH_FOR_TRANSACTION_BYTES) ||
    isSolanaError(error, SOLANA_ERROR__CODECS__CANNOT_DECODE_EMPTY_BYTE_ARRAY)
  ) {
    return "The transaction data is invalid. Please refresh and try again.";
  }
  if (isSolanaError(error, SOLANA_ERROR__TRANSACTION_ERROR__BLOCKHASH_NOT_FOUND)) {
    return "This transaction has expired. Please try again to request a new transaction.";
  }
  if (isSolanaError(error, SOLANA_ERROR__RPC__TRANSPORT_HTTP_ERROR)) {
    return "The Solana network service is unavailable. Please try again shortly.";
  }
  if (isSolanaError(error)) {
    return `Unable to complete the transaction. Please contact support with Solana error code ${error.context.__code}.`;
  }
  if (
    isWalletStandardError(error, WALLET_STANDARD_ERROR__USER__REQUEST_REJECTED) ||
    // Phantom and other provider wallets use EIP-1193's rejection code.
    // https://docs.phantom.com/solana/errors
    (typeof error === "object" && error !== null && "code" in error && error.code === 4001)
  ) {
    return "Transaction cancelled in your wallet.";
  }
  if (isWalletStandardError(error)) {
    return `Your wallet could not complete the request. Please reconnect or contact support with wallet error code ${error.context.__code}.`;
  }
  return error instanceof Error ? error.message : "Unable to complete the transaction. Please try again.";
}
