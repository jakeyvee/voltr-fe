import { SplitClient } from "@/client/split.client";
import MarketClientPage from "./Market";
import { createConnection } from "@/lib/Connection";
import * as smIdl from "@/client/idl/split_program.json";
import { PublicKey } from "@solana/web3.js";

export default async function MarketPage({
  params,
}: {
  params: { marketId: string };
}) {
  const smc = new SplitClient(
    createConnection(),
    smIdl as any,
    PublicKey.default
  );

  const marketAcc = await smc.fetchMarketAcc(new PublicKey(params.marketId));
  const [amm] = smc.findAMM(new PublicKey(params.marketId));
  const ammAcc = await smc.fetchAMMAcc(amm);

  return (
    <MarketClientPage
      params={params}
      marketAcc={marketAcc as any}
      ammAcc={ammAcc as any}
    />
  );
}
