# Changelog

## Unreleased

- Accept v1 transactions returned by the vault API, including payloads up to 4096 bytes, through Solana Kit 8 and raw Wallet Standard signing.
- Check the live wallet connection, account, network, and v1 signing support before prompting. Preserve the existing legacy/v0 adapter path.
- Submit wallet-signed v1 transactions using base64. Support wallets offering v1 sign-and-send, and surface signing rejection without a second signing attempt.
- Confirm the submitted signature with bounded retries and backoff for RPC failures. Report onchain failures immediately and retain the signature when confirmation times out.
- Map Solana and wallet error codes to readable production messages, including nested preflight errors. Run compatibility and error tests in development and production modes.
- Configure the wallet and submission chain through `NEXT_PUBLIC_SOLANA_CHAIN` and verify the RPC genesis hash before API transaction signing or broadcasting.
- Add offline transaction compatibility tests. Node.js 22 or newer is required for the Wallet Standard dependencies.
