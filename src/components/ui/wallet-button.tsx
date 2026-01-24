"use client";

import { UnifiedWalletButton, useWallet } from "@jup-ag/wallet-adapter";
import { useEffect } from "react";

export default function WalletButton() {
  const wallet = useWallet();

  useEffect(() => {
    if (
      wallet &&
      wallet.wallet &&
      !wallet.connected &&
      wallet.wallet.adapter.connected
    ) {
      wallet.disconnect();
      wallet.connect();
    }
  }, [wallet]);

  return (
    <UnifiedWalletButton
      buttonClassName="btn-sm !bg-gradient-to-t !from-ranger-500 !to-ranger-400 !bg-[length:100%_100%] !bg-[bottom] !py-[5px] !text-gray-900 !shadow-[inset_0px_1px_0px_0px_theme(colors.white/.16)] hover:!bg-[length:100%_150%]"
      currentUserClassName="btn-sm !bg-gradient-to-t !from-ranger-500 !to-ranger-400 !bg-[length:100%_100%] !bg-[bottom] !py-[5px] !text-gray-900 !shadow-[inset_0px_1px_0px_0px_theme(colors.white/.16)] hover:!bg-[length:100%_150%]"
    />
  );
}
