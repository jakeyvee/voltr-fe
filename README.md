# Voltr frontend

Next.js frontend for discovering Voltr vaults, creating and managing vaults, and depositing or withdrawing through the Voltr REST API. Jupiter's Unified Wallet provider manages the connected wallet. Vault and token balances are refreshed through Solana account subscriptions.

## Setup

Use Node.js 22 or newer and pnpm. Node 22 is required by the Wallet Standard dependencies. The package uses ES modules, including the TypeScript test runner.

```sh
pnpm install
```

Create `.env.local` with the public API, chain, and RPC endpoint:

```dotenv
NEXT_PUBLIC_API_URL=https://api.voltr.xyz
NEXT_PUBLIC_SOLANA_CHAIN=solana:mainnet
NEXT_PUBLIC_SOLANA_RPC_URL=https://api.mainnet-beta.solana.com
```

These values are included in the browser bundle. Use an RPC endpoint authorized for browser access and provisioned for the application's traffic. The public RPC URL above is a setup example.

`NEXT_PUBLIC_SOLANA_CHAIN` accepts `solana:mainnet`, `solana:devnet`, or `solana:testnet` and defaults to mainnet for existing deployments. Both the wallet provider and API transaction submission use this setting. The configured RPC's genesis hash is checked before each API transaction's wallet prompt. A mismatch, an unknown cluster, or a failed verification prevents signing and broadcasting. A devnet deployment must also use a devnet API and RPC. Next.js embeds public environment values at build time, so rebuild after changing the network configuration.

```sh
pnpm dev
```

Open http://localhost:3000, connect a wallet, and select a vault. Deposit, request withdrawal, cancel withdrawal, and complete withdrawal actions ask the API to build a transaction for the connected account.

## API transaction submission

The API returns `{ transaction: "<base58-encoded transaction bytes>" }`. `src/lib/apiTransaction.ts` uses Solana Kit 8 codecs to validate and identify legacy, v0, and v1 transactions. Size validation follows the transaction version: legacy/v0 retain the 1232-byte limit and v1 allows 4096 bytes. Kit 8 is a direct dependency because the existing web3.js 1.x stack cannot decode and serialize v1 transactions.

Legacy and v0 use the existing wallet adapter. V1 uses the selected adapter's original Wallet Standard wallet, verifies the connected account and network, and requires the signing feature to explicitly advertise numeric version `1`. The Wallet Standard feature API version (`"1.0.0"`) is separate from transaction version support. The published feature types currently omit numeric `1`, so support is checked at runtime.

For v1, the frontend prefers `solana:signTransaction`, validates the signed bytes returned by the wallet, and submits them through RPC with base64 encoding. Wallets may refresh the transaction before signing; the returned transaction is the one submitted. Wallets that only support v1 through `solana:signAndSendTransaction` use that feature. A rejected or failed signing request is surfaced without trying another signing method. Wallets without v1 support receive an actionable error before a signing prompt.

Submission is followed by signature-status confirmation. Healthy pending responses are polled every two seconds. HTTP errors, rate limits, and other RPC lookup failures retry with exponential backoff from two to ten seconds, within a shared two-minute deadline. Onchain execution errors fail immediately. The deadline also interrupts an in-flight lookup or backoff delay. A timeout reports the submitted signature as unconfirmed so the user can check its status before retrying; confirmation never resubmits the transaction. Confirmation uses the signature because the API and sign-and-send wallets do not provide the actual transaction's expiry height.

`src/lib/transactionError.ts` maps SDK error codes to application-owned messages for production toasts, including nested preflight failures, insufficient funds, custom program errors, missing signatures, invalid payloads, and size limits. Unmapped SDK errors include their numeric code for support. This mapping is independent of [Kit's development-only error messages](https://www.solanakit.com/docs/advanced-guides/errors).

The API can continue returning legacy/v0. Emitting v1 requires a compatible wallet, network/RPC support, and an API builder that supplies v1 resource limits. The frontend preserves the API's message configuration; it does not construct v1 resource budgets. Create/manage pages construct v0 transactions independently.

## Validation

```sh
pnpm test
pnpm typecheck
pnpm lint
pnpm build
```

`pnpm test` runs the suite with both `NODE_ENV=development` and `NODE_ENV=production`, so production error messages are checked with Kit's message table disabled. Tests use Node's test runner with the `tsx` loader. They build and sign transaction fixtures with Kit and mock wallet features and HTTP RPC responses. Coverage includes payloads larger than 1232 bytes, legacy/v0 compatibility, wallet capability/account checks, wallet rejection, wallet-refreshed transactions, missing signatures, size limits, RPC retry/backoff and timeout behavior, and network mismatches before signing. They submit no transactions to a network.

The production build may need network access for fonts and API requests. A real v1-capable wallet must also be tested against a cluster supporting v1 before enabling v1 responses in production.

## Neutral Trade bundles

Vault admins can add or remove the Neutral Trade Bundles adaptor from **Manage Adaptors**.
Registration enables the adaptor for that vault; initialize a bundle strategy and allocate assets with
the [Neutral operator guide](https://docs.voltr.xyz/vault-owners/strategies/neutral).
Redemptions require a keeper settlement between the manager's request and claim.
