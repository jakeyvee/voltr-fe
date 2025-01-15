import { PublicKey } from "@solana/web3.js";

export const LP_TOKEN_DECIMALS = 9;

// TODO: store below in a db or json file
export const USDC_MINT = new PublicKey(
  "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v"
);

export const STRATEGY_MAP = {
  HtHYn3juNQe7B4xXe2mi9x5xcfUHZrsw3gKE78cQypys: "kamino",
  GGf8eUHvTX3CLC3HubPpMxm8iqHKheR6ZEK1QAyozv5j: "drift",
  "4i9kzGr1UkxBCCUkQUQ4vsF51fjdt2knKxrwM1h1NW4g": "solend",
  "4JHtgXyMb9gFJ1hGd2sh645jrZcxurSG3QP7Le3aTMTx": "marginfi",
};

export const USDC_MARKETS_KEYS = {
  drift: {
    program: new PublicKey("dRiftyHA39MWEi3m9aunc5MzRF1JYuBsbn6VPcn33UH"),
    liquidityReserve: new PublicKey(
      "GXWqPpjQpdz7KZw9p7f5PX2eGxHAhvpNXiviFkAB8zXg"
    ),
    liquidityReserveAuth: new PublicKey(
      "JCNCMFXo5M5qwUPg2Utu1u6YWp3MbygxqBsBeXXJfrw"
    ),
  },
  kamino: {
    program: new PublicKey("KLend2g3cP87fffoy8q1mQqGKjrxjC8boSyAYavgmjD"),
    liquidityReserve: new PublicKey(
      "HTyrXvSvBbD7WstvU3oqFTBZM1fPZJPxVRvwLAmCTDyJ"
    ),
    liquidityReserveAuth: new PublicKey(
      "81BgcfZuZf9bESLvw3zDkh7cZmMtDwTPgkCvYu7zx26o"
    ),
  },
  solend: {
    program: new PublicKey("So1endDq2YkqhipRh3WViPa8hdiSpxWy6z3Z6tMCpAo"),
    liquidityReserve: new PublicKey(
      "8SheGtsopRUDzdiD6v6BR9a6bqZ9QwywYQY99Fp5meNf"
    ),
    liquidityReserveAuth: new PublicKey(
      "DdZR6zRFiUt4S5mg7AV1uKB2z1f1WzcNYCaTEEWPAuby"
    ),
  },
  marginfi: {
    program: new PublicKey("2s37akK2eyBbp8DZgCm7RtsaEz8eJP3Nxd4urLHQv7yB"),
    liquidityReserve: new PublicKey(
      "7jaiZR5Sk8hdYN9MxTpczTcwbWpb5WEoxSANuUwveuat"
    ),
    liquidityReserveAuth: new PublicKey(
      "3uxNepDbmkDNq6JhRja5Z8QwbTrfmkKP8AKZV5chYDGG"
    ),
  },
};
