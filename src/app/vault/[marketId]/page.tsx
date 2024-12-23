import MarketClientPage from "./Market";

export default async function MarketPage({
  params,
}: {
  params: { marketId: string };
}) {
  return <MarketClientPage params={{ marketId: params.marketId }} />;
}
