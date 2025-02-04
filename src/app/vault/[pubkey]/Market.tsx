"use client";

import { useEffect, useState } from "react";
import { useWallet } from "@jup-ag/wallet-adapter";
import { BN } from "@coral-xyz/anchor";
import {
  ComputeBudgetProgram,
  PublicKey,
  SystemProgram,
  TransactionConfirmationStrategy,
  TransactionMessage,
  VersionedTransaction,
} from "@solana/web3.js";
import { createConnection } from "@/lib/publicConnection";
import {
  createAssociatedTokenAccountIdempotentInstruction,
  createCloseAccountInstruction,
  createSyncNativeInstruction,
  getAssociatedTokenAddressSync,
  NATIVE_MINT,
  TOKEN_PROGRAM_ID,
} from "@solana/spl-token";
import { toast } from "react-toastify";
import ChartCard from "./chart/chart-card";
import { LP_TOKEN_DECIMALS } from "@/lib/Constants";
import { VoltrClient } from "@voltr/vault-sdk";
import MetricCard from "./metric/Metric";
import OrgCard from "./org/Org";
import VaultCard from "./vault/Vault";
import AllocationsCard from "./allocation/allocations-card";
import { ThirtyDaysDailyApy } from "./chart/RealTimeChartJs";
import { Breadcrumb } from "./breadcrumb/Breadcrumb";
import SwapCard from "./swap/SwapCard";

export interface VaultInformation {
  pubkey: string;
  name: string;
  description: string;
  externalUri: string;
  totalValue: number;
  org: {
    name: string;
    description: string;
    web: string;
    logo: string;
    social: string;
  };
  token: {
    name: string;
    decimals: number;
    icon: string;
    mint: string;
    price: number;
  };
  apy: {
    oneHour: number;
    oneDay: number;
    sevenDays: number;
    thirtyDays: number;
  };
  allocations: {
    orgName: string;
    strategyDescription: string;
    tokenName: string;
    positionValue: number;
  }[];
  thirtyDaysDailyApy: ThirtyDaysDailyApy;
}

export default function MarketClientPage(vault: VaultInformation) {
  const wallet = useWallet();
  const [isButtonLoading, setIsButtonLoading] = useState(false);
  const [selectedTab, setSelectedTab] = useState<"deposit" | "redeem">(
    "deposit"
  );
  const [inputAmount, setInputAmount] = useState("");
  const [outputAmount, setOutputAmount] = useState("");
  const conn = createConnection();
  const vc = new VoltrClient(conn);

  // Calculate tokens based on selected tab
  const tokenPair = [
    {
      symbol: vault.token.name,
      mint: vault.token.mint,
      decimals: vault.token.decimals,
      logoURI: vault.token.icon,
    },
    {
      symbol: `lp${vault.token.name}`,
      mint: vault.token.mint,
      decimals: 9,
      logoURI: vault.token.icon,
    },
  ];

  const [inputToken, setInputToken] = useState(tokenPair[0]);
  const [outputToken, setOutputToken] = useState(tokenPair[1]);

  // Update the debounce utility with proper typing
  const debounce = <F extends (...args: any[]) => any>(
    func: F,
    wait: number
  ) => {
    let timeout: NodeJS.Timeout;
    const debouncedFn = (...args: Parameters<F>) => {
      clearTimeout(timeout);
      timeout = setTimeout(() => func(...args), wait);
    };

    debouncedFn.clear = () => {
      clearTimeout(timeout);
    };

    return debouncedFn;
  };

  // Memoize the calculation functions
  const debouncedCalculate = debounce(async (amount: string) => {
    if (amount && !isNaN(Number(amount)) && Number(amount) > 0) {
      try {
        if (selectedTab === "deposit") {
          const lpTokensAmount = await vc.calculateLpTokensForDeposit(
            new BN(Number(amount) * 10 ** inputToken.decimals),
            new PublicKey(vault.pubkey)
          );

          setOutputAmount(
            (lpTokensAmount.toNumber() / 10 ** outputToken.decimals).toString()
          );
        } else {
          const assetTokensAmount = await vc.calculateAssetsForWithdraw(
            new PublicKey(vault.pubkey),
            new BN(Number(amount) * 10 ** LP_TOKEN_DECIMALS) // LP TOKEN ALWAYS HAS 9 DECIMALS
          );
          setOutputAmount(
            (
              assetTokensAmount.toNumber() /
              10 ** outputToken.decimals
            ).toString()
          );
        }
      } catch (error) {
        console.error("Calculation error:", error);
        setOutputAmount("");
      }
    } else {
      setOutputAmount("");
    }
  }, 500); // 500ms debounce delay

  useEffect(() => {
    debouncedCalculate(inputAmount);

    // Cleanup function
    return () => {
      debouncedCalculate.clear?.();
    };
  }, [inputAmount, inputToken]);

  useEffect(() => {
    setInputToken(selectedTab === "deposit" ? tokenPair[0] : tokenPair[1]);
    setOutputToken(selectedTab === "deposit" ? tokenPair[1] : tokenPair[0]);
  }, [selectedTab]);

  const handleButtonClick = async () => {
    if (!wallet || !wallet.connected || !wallet.publicKey) {
      console.error("Wallet not connected");
      return;
    }

    setIsButtonLoading(true);
    try {
      const user = wallet.publicKey;
      const marketPk = new PublicKey(vault.pubkey);
      const assetMint = new PublicKey(vault.token.mint);
      const inputAmountBN = new BN(
        Number(inputAmount) * 10 ** inputToken.decimals
      );

      const ixs = [];
      const msg = selectedTab === "deposit" ? "deposited" : "redeemed";

      // Handle swap instruction based on direction
      if (selectedTab === "deposit") {
        if (assetMint.equals(NATIVE_MINT)) {
          const assetAta = getAssociatedTokenAddressSync(assetMint, user);
          ixs.push(
            createAssociatedTokenAccountIdempotentInstruction(
              user,
              assetAta,
              user,
              assetMint
            )
          );

          ixs.push(
            SystemProgram.transfer({
              fromPubkey: user,
              toPubkey: assetAta,
              lamports: inputAmountBN.toNumber(),
            })
          );

          ixs.push(createSyncNativeInstruction(assetAta));
        }
        const vaultLpMint = vc.findVaultLpMint(marketPk);
        ixs.push(
          createAssociatedTokenAccountIdempotentInstruction(
            user,
            getAssociatedTokenAddressSync(vaultLpMint, user),
            user,
            vaultLpMint
          )
        );

        ixs.push(
          await vc.createDepositVaultIx(inputAmountBN, {
            userAuthority: user,
            vault: marketPk,
            vaultAssetMint: assetMint,
            assetTokenProgram: TOKEN_PROGRAM_ID,
          })
        );
      } else {
        ixs.push(
          createAssociatedTokenAccountIdempotentInstruction(
            user,
            getAssociatedTokenAddressSync(assetMint, user),
            user,
            assetMint
          )
        );

        ixs.push(
          await vc.createWithdrawVaultIx(inputAmountBN, {
            userAuthority: user,
            vault: marketPk,
            vaultAssetMint: assetMint,
            assetTokenProgram: TOKEN_PROGRAM_ID,
          })
        );

        if (assetMint.equals(NATIVE_MINT)) {
          ixs.push(
            createCloseAccountInstruction(
              getAssociatedTokenAddressSync(assetMint, user),
              user,
              user
            )
          );
        }
      }

      const modifyComputeUnits = ComputeBudgetProgram.setComputeUnitLimit({
        units: 400000,
      });
      const { lastValidBlockHeight, blockhash } =
        await conn.getLatestBlockhash();

      const messageV0 = new TransactionMessage({
        payerKey: wallet.publicKey,
        recentBlockhash: blockhash,
        instructions: [modifyComputeUnits, ...ixs],
      }).compileToV0Message();

      const transaction = new VersionedTransaction(messageV0);
      const txSig = await wallet.sendTransaction(transaction, conn);

      const strategy: TransactionConfirmationStrategy = {
        signature: txSig,
        lastValidBlockHeight,
        blockhash: blockhash,
      };

      await conn.confirmTransaction(strategy, "confirmed");
      toast.success(`Successfully ${msg}!`);
    } catch (error) {
      console.error("Error:", error);
      toast.error(`Error: ${error}`);
    } finally {
      setIsButtonLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-15.5rem)] max-w-6xl mx-auto px-6 py-6">
      <Breadcrumb name={vault.name} token={vault.token} />
      <div className="mt-6 grid grid-cols-12 gap-2 w-full">
        <div className="flex flex-col col-span-full gap-2 order-2 md:col-span-8 md:order-1">
          <MetricCard
            realtimeApy={vault.apy.oneHour}
            assetPrice={vault.token.price}
            totalLiquidity={vault.totalValue}
            tokenDecimals={vault.token.decimals}
          />
          <AllocationsCard
            vaultTotalValue={vault.totalValue}
            allocations={vault.allocations}
          />
          <ChartCard {...vault.thirtyDaysDailyApy} />
        </div>
        <div className="flex flex-col col-span-full z-0 gap-2 order-1 md:col-span-4 md:order-2">
          <VaultCard
            vaultExternalUri={vault.externalUri}
            vaultDescription={vault.description}
            vaultAPY={vault.apy}
          />
          <OrgCard
            orgName={vault.org.name}
            orgWeb={vault.org.web}
            orgDescription={vault.org.description}
            orgImage={vault.org.logo}
            orgSocial={vault.org.social}
          />
          <SwapCard
            selectedTab={selectedTab}
            setSelectedTab={setSelectedTab}
            inputToken={inputToken}
            outputToken={outputToken}
            inputAmount={inputAmount}
            setInputAmount={setInputAmount}
            outputAmount={outputAmount}
            isButtonLoading={isButtonLoading}
            handleButtonClick={handleButtonClick}
            wallet={wallet}
          />
        </div>
      </div>
    </div>
  );
}
