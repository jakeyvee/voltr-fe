import { notFound } from "next/navigation";
import MarketClientPage, { VaultInformation } from "./Market";

const getVaultInfo = async (pubkey: string) => {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
  const res = await fetch(`${baseUrl}/api/vault/${pubkey}`, {
    cache: "no-store",
  });
  if (!res.ok) notFound();
  const { vault }: { vault: VaultInformation } = await res.json();
  return vault;
};

export default async function MarketPage({
  params,
}: {
  params: { pubkey: string };
}) {
  const vault = await getVaultInfo(params.pubkey);
  return <MarketClientPage {...vault} />;
}
