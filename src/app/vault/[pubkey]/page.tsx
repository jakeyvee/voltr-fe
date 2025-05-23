import { notFound } from "next/navigation";
import MarketClientPage, { VaultInformation } from "./Market";

const getVaultInfo = async (pubkey: string) => {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL;
  const res = await fetch(`${baseUrl}/vault/${pubkey}`, {
    next: { revalidate: 300 }, // 5 minutes (300 seconds)
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
