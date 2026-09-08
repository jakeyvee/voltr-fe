"use client"; // Keep this as it's a client component

import { UnifiedWalletProvider } from "@jup-ag/wallet-adapter";
import { getSolanaChain, getWalletAdapterNetwork } from "@/lib/solanaChain";

const WalletWrapper = ({ children }: { children: React.ReactNode }) => {
  return (
    <UnifiedWalletProvider
      wallets={[]}
      config={{
        autoConnect: false,
        env: getWalletAdapterNetwork(getSolanaChain()),
        metadata: {
          name: "UnifiedWallet",
          description: "UnifiedWallet",
          url: "https://jup.ag",
          iconUrls: ["https://jup.ag/favicon.ico"],
        },
        walletlistExplanation: {
          href: "https://station.jup.ag/docs/additional-topics/wallet-list",
        },
        theme: "jupiter",
        lang: "en",
      }}
    >
      {children}
    </UnifiedWalletProvider>
  );
};

export default WalletWrapper;
