"use client";

import { useEffect, useState } from "react";
import { useWallet } from "@jup-ag/wallet-adapter";
import { BN } from "@coral-xyz/anchor";
import {
  ComputeBudgetProgram,
  PublicKey,
  TransactionConfirmationStrategy,
  TransactionMessage,
  VersionedTransaction,
} from "@solana/web3.js";
import { createConnection } from "@/lib/publicConnection";
import { getAccount, getAssociatedTokenAddressSync } from "@solana/spl-token";
import { toast } from "react-toastify";
import ChartCard from "./chart/chart-card";
import MetricCard from "./metric/Metric";
import VaultCard, { FeeConfiguration, Integration } from "./vault/Vault";
import AllocationsCard from "./allocation/allocations-card";
import { DailyStats } from "./chart/RealTimeChartJs";
import { Breadcrumb } from "./breadcrumb/Breadcrumb";
import SwapCard, { RequestWithdrawal } from "./swap/SwapCard";
import { DirectWithdrawalService } from "@/lib/directWithdrawalService";
import { getAddressLookupTableAccounts } from "@/lib/addressLookupUtils";
import { bs58 } from "@coral-xyz/anchor/dist/cjs/utils/bytes";
import { SEEDS, VAULT_PROGRAM_ID } from "@voltr/vault-sdk";

export interface VaultInformation {
  pubkey: string;
  name: string;
  description: string;
  externalUri: string;
  totalValue: number;
  withdrawalWaitingPeriod: number;
  feeConfiguration: FeeConfiguration;
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
    oneDay: number;
    sevenDays: number;
    thirtyDays: number;
    allTime: number;
  };
  allocations: {
    orgName: string;
    strategyDescription: string;
    tokenName: string;
    positionValue: number;
  }[];
  dailyStats: DailyStats;
  integrations: Integration[];
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

export default function MarketClientPage(initialVault: VaultInformation) {
  const {
    vaultData: vault,
    isLoading: _isRefreshing,
    refreshVaultData,
  } = useRefreshVaultData(initialVault, initialVault.pubkey);

  const wallet = useWallet();
  const [isButtonLoading, setIsButtonLoading] = useState(false);
  const [selectedTab, setSelectedTab] = useState<"deposit" | "withdraw">(
    "deposit"
  );
  const [inputAmount, setInputAmount] = useState("");
  const [userAssetAmount, setUserAssetAmount] = useState<number>(0);
  const [userAssetWalletAmount, setUserAssetWalletAmount] = useState<number>(0);

  const conn = createConnection();
  const vaultPk = new PublicKey(vault.pubkey);
  const directWithdrawalService = new DirectWithdrawalService(conn);
  const supportsDirectWithdrawal =
    directWithdrawalService.supportsDirectWithdrawal(vault.pubkey);
  const [userWithdrawRequest, setUserWithdrawRequest] =
    useState<RequestWithdrawal | null>(null);

  const refreshUserBalance = async () => {
    if (!wallet.connected || !wallet.publicKey) {
      setUserAssetAmount(0);
      return;
    }

    try {
      const balanceRes = await fetch(
        `${API_BASE_URL}/vault/${
          vault.pubkey
        }/user/${wallet.publicKey.toBase58()}/balance`
      );
      if (balanceRes.ok) {
        const { data } = await balanceRes.json();
        setUserAssetAmount(data.userAssetAmount);
      } else {
        console.error("Failed to fetch user balance");
        setUserAssetAmount(0);
      }
    } catch (error) {
      console.error("Error refreshing user balance:", error);
      setUserAssetAmount(0);
    }
  };

  const refreshUserWithdrawal = async () => {
    if (!wallet.connected || !wallet.publicKey) {
      setUserWithdrawRequest(null);
      return;
    }

    try {
      const withdrawalRes = await fetch(
        `${API_BASE_URL}/vault/${
          vault.pubkey
        }/user/${wallet.publicKey.toBase58()}/pending-withdrawal`
      );
      if (withdrawalRes.ok) {
        const { data } = await withdrawalRes.json();
        setUserWithdrawRequest(data);
      } else {
        console.error("Failed to fetch pending withdrawal");
        setUserWithdrawRequest(null);
      }
    } catch (error) {
      console.error("Error refreshing pending withdrawal:", error);
      setUserWithdrawRequest(null);
    }
  };

  useEffect(() => {
    let vaultListenerId = -1;
    let withdrawReceiptListenerId = -1;
    let assetBalanceListenerId = -1;
    let lpBalanceListenerId = -1;

    const setupVaultAccountListener = async () => {
      // Clean up previous listener
      if (vaultListenerId > 0) {
        conn.removeAccountChangeListener(vaultListenerId);
      }

      // Set up listener for vault account changes
      vaultListenerId = conn.onAccountChange(
        vaultPk,
        async (_accountInfo) => {
          await new Promise((resolve) => setTimeout(resolve, 3000));
          await refreshVaultData();
        },
        "confirmed"
      );
    };

    const setupWithdrawReceiptListener = async () => {
      if (!wallet.connected || !wallet.publicKey) {
        if (withdrawReceiptListenerId > 0) {
          conn.removeAccountChangeListener(withdrawReceiptListenerId);
          withdrawReceiptListenerId = -1;
        }
        setUserWithdrawRequest(null);
        return;
      }

      // Clean up previous listener
      if (withdrawReceiptListenerId > 0) {
        conn.removeAccountChangeListener(withdrawReceiptListenerId);
      }

      const [withdrawReceiptPda] = PublicKey.findProgramAddressSync(
        [
          SEEDS.REQUEST_WITHDRAW_VAULT_RECEIPT,
          vaultPk.toBuffer(),
          wallet.publicKey.toBuffer(),
        ],
        VAULT_PROGRAM_ID
      );

      const checkAndUpdateWithdrawRequest = async () => {
        await refreshUserWithdrawal();
      };

      // Initial check
      await checkAndUpdateWithdrawRequest();

      // Set up listener
      const listenerId = conn.onAccountChange(
        withdrawReceiptPda,
        async () => {
          await checkAndUpdateWithdrawRequest();
        },
        "confirmed"
      );

      withdrawReceiptListenerId = listenerId;
    };

    const setupAssetBalanceListener = async () => {
      if (!wallet.connected || !wallet.publicKey) {
        if (assetBalanceListenerId > 0) {
          conn.removeAccountChangeListener(assetBalanceListenerId);
          assetBalanceListenerId = -1;
        }
        setUserAssetWalletAmount(0);
        return;
      }

      // Clean up previous listener
      if (assetBalanceListenerId > 0) {
        conn.removeAccountChangeListener(assetBalanceListenerId);
      }

      const userAssetAta = getAssociatedTokenAddressSync(
        new PublicKey(vault.token.mint),
        wallet.publicKey
      );

      const updateAssetBalance = async () => {
        try {
          const userAssetAtaAcc = await getAccount(
            conn,
            userAssetAta,
            "confirmed"
          );
          setUserAssetWalletAmount(Number(userAssetAtaAcc?.amount));
        } catch (error) {
          setUserAssetWalletAmount(0);
        }
      };

      // Initial balance fetch
      await updateAssetBalance();

      // Set up listener
      const listenerId = conn.onAccountChange(
        userAssetAta,
        updateAssetBalance,
        "confirmed"
      );

      assetBalanceListenerId = listenerId;
    };

    const setupLpBalanceListener = async () => {
      if (!wallet.connected || !wallet.publicKey) {
        // Clean up listener if wallet disconnected
        if (lpBalanceListenerId > 0) {
          conn.removeAccountChangeListener(lpBalanceListenerId);
          lpBalanceListenerId = -1;
        }
        setUserAssetAmount(0);
        return;
      }

      // Clean up previous listener
      if (lpBalanceListenerId > 0) {
        conn.removeAccountChangeListener(lpBalanceListenerId);
      }

      const [vaultLpMint] = PublicKey.findProgramAddressSync(
        [SEEDS.VAULT_LP_MINT, vaultPk.toBuffer()],
        VAULT_PROGRAM_ID
      );

      const userLpAta = getAssociatedTokenAddressSync(
        vaultLpMint,
        wallet.publicKey
      );

      const updateLpBalance = async () => {
        await refreshUserBalance();
      };

      // Initial balance fetch
      await updateLpBalance();

      // Set up listener
      const listenerId = conn.onAccountChange(
        userLpAta,
        async (_accountInfo) => {
          await updateLpBalance();
        },
        "confirmed"
      );

      lpBalanceListenerId = listenerId;
    };

    // Set up all listeners
    setupVaultAccountListener();
    setupWithdrawReceiptListener();
    setupAssetBalanceListener();
    setupLpBalanceListener();

    // Cleanup function
    return () => {
      const listenerIds = [
        vaultListenerId,
        withdrawReceiptListenerId,
        assetBalanceListenerId,
        lpBalanceListenerId,
      ];

      listenerIds.forEach((id) => {
        if (id > 0) {
          conn.removeAccountChangeListener(id);
        }
      });
    };
  }, [wallet.connected, wallet.publicKey]);

  const handleButtonClick = async () => {
    if (!wallet || !wallet.connected || !wallet.publicKey) {
      console.error("Wallet not connected");
      return;
    }

    setIsButtonLoading(true);
    try {
      const user = wallet.publicKey;
      const assetMint = new PublicKey(vault.token.mint);
      const inputAmountBN = new BN(
        Number(inputAmount) * 10 ** vault.token.decimals
      );
      let msg = "";

      if (
        selectedTab === "withdraw" &&
        supportsDirectWithdrawal &&
        directWithdrawalService
      ) {
        msg = "instant withdrawn";
        const { instructions, lookupTableAddresses } =
          await directWithdrawalService.createDirectWithdrawalInstructions(
            inputAmountBN,
            inputAmountBN.toString() === userAssetAmount.toString(),
            vault.pubkey,
            user,
            assetMint
          );

        const modifyComputeUnits = ComputeBudgetProgram.setComputeUnitLimit({
          units: 800000,
        });
        const { lastValidBlockHeight, blockhash } =
          await conn.getLatestBlockhash();
        const lookupTableAccounts = await getAddressLookupTableAccounts(
          lookupTableAddresses,
          conn
        );
        const messageV0 = new TransactionMessage({
          payerKey: wallet.publicKey,
          recentBlockhash: blockhash,
          instructions: [modifyComputeUnits, ...instructions],
        }).compileToV0Message(lookupTableAccounts);
        const transaction = new VersionedTransaction(messageV0);
        const txSig = await wallet.sendTransaction(transaction, conn);
        const strategy: TransactionConfirmationStrategy = {
          signature: txSig,
          lastValidBlockHeight,
          blockhash,
        };
        await conn.confirmTransaction(strategy, "confirmed");
      } else {
        let endpoint = "";
        let body: object = {};

        if (selectedTab === "deposit") {
          msg = "deposited";
          endpoint = `/vault/${vault.pubkey}/deposit`;
          body = {
            userPubkey: user.toBase58(),
            lamportAmount: inputAmountBN.toString(),
          };
        } else {
          if (userWithdrawRequest === null) {
            msg = "requested withdrawal";
            endpoint = `/vault/${vault.pubkey}/request-withdrawal`;
            body = {
              userPubkey: user.toBase58(),
              lamportAmount: inputAmountBN.toString(),
              isAmountInLp: false,
              isWithdrawAll:
                inputAmountBN.toString() === userAssetAmount.toString(),
            };
          } else if (
            userWithdrawRequest.withdrawableFromTs >
            Date.now() / 1000
          ) {
            msg = "cancelled withdrawal";
            endpoint = `/vault/${vault.pubkey}/cancel-withdrawal`;
            body = { userPubkey: user.toBase58() };
          } else {
            msg = "withdrawn";
            endpoint = `/vault/${vault.pubkey}/withdraw`;
            body = { userPubkey: user.toBase58() };
          }
        }

        // Fetch serialized transaction from backend
        const res = await fetch(`${API_BASE_URL}${endpoint}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });

        if (!res.ok) {
          const errorData = await res.json();
          throw new Error(errorData.error || "Failed to build transaction");
        }
        const { transaction: serializedTx } = await res.json();

        // Deserialize, sign, and send the transaction
        const txBuffer = bs58.decode(serializedTx);
        const transaction = VersionedTransaction.deserialize(txBuffer);

        const txSig = await wallet.sendTransaction(transaction, conn);
        const { lastValidBlockHeight, blockhash } =
          await conn.getLatestBlockhash();
        const strategy: TransactionConfirmationStrategy = {
          signature: txSig,
          lastValidBlockHeight,
          blockhash,
        };
        await conn.confirmTransaction(strategy, "confirmed");
      }

      toast.success(`Successfully ${msg}!`);
      setInputAmount(""); // Clear input on success
    } catch (error: any) {
      console.error("Error:", error);
      toast.error(`Error: ${error.message || error}`);
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
            vaultApy={vault.apy}
            assetPrice={vault.token.price}
            totalLiquidity={vault.totalValue}
            tokenDecimals={vault.token.decimals}
            tokenName={vault.token.name}
          />
          <AllocationsCard
            vaultTotalValue={vault.totalValue}
            allocations={vault.allocations}
          />
          <ChartCard
            dateLabels={vault.dailyStats.dateLabels}
            apyData={vault.dailyStats.apyData}
            tvlData={vault.dailyStats.tvlData.map(
              (tvl) => tvl / Math.pow(10, vault.token.decimals)
            )}
            lpData={vault.dailyStats.lpData}
            tokenName={vault.token.name}
          />
        </div>
        <div className="flex flex-col col-span-full z-0 gap-2 order-1 md:col-span-4 md:order-2">
          <VaultCard
            vaultExternalUri={vault.externalUri}
            vaultDescription={vault.description}
            orgName={vault.org.name}
            orgDescription={vault.org.description}
            orgImage={vault.org.logo}
            orgSocial={vault.org.social}
            orgWeb={vault.org.web}
            feeConfiguration={vault.feeConfiguration}
            integrations={vault.integrations}
          />
          <SwapCard
            userAssetWalletAmount={userAssetWalletAmount}
            userAssetAmount={userAssetAmount}
            assetDecimals={vault.token.decimals}
            withdrawalWaitingPeriod={vault.withdrawalWaitingPeriod}
            userWithdrawRequest={userWithdrawRequest}
            selectedTab={selectedTab}
            setSelectedTab={setSelectedTab}
            inputSymbol={vault.token.name}
            inputLogoURI={vault.token.icon}
            inputAmount={inputAmount}
            setInputAmount={setInputAmount}
            isButtonLoading={isButtonLoading}
            handleButtonClick={handleButtonClick}
            wallet={wallet}
            supportsDirectWithdrawal={supportsDirectWithdrawal}
          />
        </div>
      </div>
    </div>
  );
}

function useRefreshVaultData(initialData: VaultInformation, pubkey: string) {
  const [vaultData, setVaultData] = useState<VaultInformation>(initialData);
  const [isLoading, setIsLoading] = useState(false);

  const refreshVaultData = async () => {
    try {
      setIsLoading(true);
      const res = await fetch(
        `${API_BASE_URL}/vault/${pubkey}?_=${Date.now()}`
      );

      if (!res.ok) throw new Error("Failed to fetch fresh data");

      const { vault } = await res.json();
      setVaultData(vault);
    } catch (error) {
      console.error("Error fetching fresh vault data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // Update state when initialData changes (e.g., when the server sends new data)
    setVaultData(initialData);
  }, [initialData]);

  useEffect(() => {
    // Fetch fresh data once the component is mounted
    refreshVaultData();
  }, [pubkey]);

  return { vaultData, isLoading, refreshVaultData };
}
