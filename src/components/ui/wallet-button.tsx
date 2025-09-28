"use client";

import { UnifiedWalletButton } from "@jup-ag/wallet-adapter";

export default function WalletButton() {
  return (
    <UnifiedWalletButton
      buttonClassName="btn-sm !bg-gradient-to-t !from-indigo-600 !to-indigo-500 !bg-[length:100%_100%] !bg-[bottom] !py-[5px] !text-white !shadow-[inset_0px_1px_0px_0px_theme(colors.white/.16)] hover:!bg-[length:100%_150%]"
      currentUserClassName="btn-sm !bg-gradient-to-t !from-indigo-600 !to-indigo-500 !bg-[length:100%_100%] !bg-[bottom] !py-[5px] !text-white !shadow-[inset_0px_1px_0px_0px_theme(colors.white/.16)] hover:!bg-[length:100%_150%]"
    />
  );
}
