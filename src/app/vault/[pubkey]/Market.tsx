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
  getAccount,
  getAssociatedTokenAddressSync,
  NATIVE_MINT,
  TOKEN_PROGRAM_ID,
} from "@solana/spl-token";
import { toast } from "react-toastify";
import ChartCard from "./chart/chart-card";
import { VoltrClient } from "@voltr/vault-sdk";
import MetricCard from "./metric/Metric";
import VaultCard, { FeeConfiguration } from "./vault/Vault";
import AllocationsCard from "./allocation/allocations-card";
import { DailyStats } from "./chart/RealTimeChartJs";
import { Breadcrumb } from "./breadcrumb/Breadcrumb";
import SwapCard, { RequestWithdrawal } from "./swap/SwapCard";

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
}

export default function MarketClientPage(initialVault: VaultInformation) {
  const { vaultData: vault, isLoading: _isRefreshing } = useRefreshVaultData(
    initialVault,
    initialVault.pubkey
  );

  const wallet = useWallet();
  const [isButtonLoading, setIsButtonLoading] = useState(false);
  const [selectedTab, setSelectedTab] = useState<"deposit" | "withdraw">(
    "deposit"
  );
  const [inputAmount, setInputAmount] = useState("");
  const [userAssetAmount, setUserAssetAmount] = useState<number>(0);
  const [userAssetWalletAmount, setUserAssetWalletAmount] = useState<number>(0);
  const conn = createConnection();
  const vc = new VoltrClient(conn);
  const vaultPk = new PublicKey(vault.pubkey);
  const [_listenerSubId, setListenerSubId] = useState<number>(-1);
  const [_withdrawReceiptListenerId, setWithdrawReceiptListenerId] =
    useState<number>(-1);
  const [_assetBalanceListenerId, setAssetBalanceListenerId] =
    useState<number>(-1);
  const [userWithdrawRequest, setUserWithdrawRequest] =
    useState<RequestWithdrawal | null>(null);

  const calculateAndSetUserAssetAmount = async (userLpAta: PublicKey) => {
    const userLpAtaAcc = await getAccount(conn, userLpAta, "confirmed");
    const userLpAmount = userLpAtaAcc?.amount;
    const userAssetAmount = await vc.calculateAssetsForWithdraw(
      vaultPk,
      new BN(userLpAmount.toString())
    );
    setUserAssetAmount(userAssetAmount.toNumber());
  };

  useEffect(() => {
    const fetchRequestWithdrawVaultReceipt = async () => {
      if (wallet.connected && wallet.publicKey) {
        const walletPubkey = wallet.publicKey;
        const requestWithdrawVaultReceipt = vc.findRequestWithdrawVaultReceipt(
          vaultPk,
          walletPubkey
        );

        const checkAndUpdateWithdrawRequest = async () => {
          const requestWithdrawVaultReceiptInfo = await conn.getAccountInfo(
            requestWithdrawVaultReceipt,
            "confirmed"
          );

          if (requestWithdrawVaultReceiptInfo) {
            const userWithdrawRequest = await vc.getPendingWithdrawalForUser(
              vaultPk,
              walletPubkey
            );
            setUserWithdrawRequest({
              amountAtPresent:
                userWithdrawRequest.amountAssetToWithdrawAtPresent,
              withdrawableFromTs: userWithdrawRequest.withdrawableFromTs,
            });
          } else {
            setUserWithdrawRequest(null);
          }
        };

        await checkAndUpdateWithdrawRequest();

        const subId = conn.onAccountChange(
          requestWithdrawVaultReceipt,
          async () => {
            await checkAndUpdateWithdrawRequest();
          },
          { commitment: "confirmed" }
        );

        setWithdrawReceiptListenerId((prev) => {
          if (prev > 0) conn.removeAccountChangeListener(prev);
          return subId;
        });
      } else {
        setUserWithdrawRequest(null);
        setWithdrawReceiptListenerId((prev) => {
          if (prev > 0) conn.removeAccountChangeListener(prev);
          return -1;
        });
      }
    };

    const fetchUserAssetWalletBalance = async () => {
      if (wallet.connected && wallet.publicKey) {
        const userAssetAta = getAssociatedTokenAddressSync(
          new PublicKey(vault.token.mint),
          wallet.publicKey
        );

        const updateAssetBalance = async () => {
          const userAssetAtaAcc = await getAccount(
            conn,
            userAssetAta,
            "confirmed"
          );
          const userAssetAmount = userAssetAtaAcc?.amount;
          setUserAssetWalletAmount(Number(userAssetAmount));
        };

        await updateAssetBalance();

        const subId = conn.onAccountChange(
          userAssetAta,
          async () => {
            await updateAssetBalance();
          },
          { commitment: "confirmed" }
        );

        setAssetBalanceListenerId((prev) => {
          if (prev > 0) conn.removeAccountChangeListener(prev);
          return subId;
        });
      } else {
        setUserAssetWalletAmount(0);
        setAssetBalanceListenerId((prev) => {
          if (prev > 0) conn.removeAccountChangeListener(prev);
          return -1;
        });
      }
    };

    const fetchUserLpAmount = async () => {
      if (wallet.connected && wallet.publicKey) {
        const { vaultLpMint } = vc.findVaultAddresses(vaultPk);
        const userLpAta = getAssociatedTokenAddressSync(
          vaultLpMint,
          wallet.publicKey
        );
        await calculateAndSetUserAssetAmount(userLpAta);

        const subId = conn.onAccountChange(
          userLpAta,
          async (_accountInfo) => {
            await calculateAndSetUserAssetAmount(userLpAta);
          },
          { commitment: "confirmed" }
        );

        setListenerSubId((prev) => {
          if (prev > 0) conn.removeAccountChangeListener(prev);
          return subId;
        });
      } else {
        setUserAssetAmount(0);
        setListenerSubId((prev) => {
          if (prev > 0) conn.removeAccountChangeListener(prev);
          return -1;
        });
      }
    };

    fetchRequestWithdrawVaultReceipt();
    fetchUserAssetWalletBalance();
    fetchUserLpAmount();

    return () => {
      [
        _listenerSubId,
        _withdrawReceiptListenerId,
        _assetBalanceListenerId,
      ].forEach((id) => {
        if (id > 0) {
          conn.removeAccountChangeListener(id);
        }
      });
    };
  }, [wallet.connected && wallet.publicKey]);

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

      const ixs = [];
      const msg =
        selectedTab === "deposit"
          ? "deposited"
          : userWithdrawRequest === null
          ? "requested withdrawal"
          : userWithdrawRequest.withdrawableFromTs > Date.now() / 1000
          ? "cancelled withdrawal"
          : "withdrawn";

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
        const vaultLpMint = vc.findVaultLpMint(vaultPk);
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
            userTransferAuthority: user,
            vault: vaultPk,
            vaultAssetMint: assetMint,
            assetTokenProgram: TOKEN_PROGRAM_ID,
          })
        );
      } else {
        if (userWithdrawRequest === null) {
          const vaultLpMint = vc.findVaultLpMint(vaultPk);
          const requestWithdrawVaultReceipt =
            vc.findRequestWithdrawVaultReceipt(vaultPk, user);
          ixs.push(
            createAssociatedTokenAccountIdempotentInstruction(
              user,
              getAssociatedTokenAddressSync(
                vaultLpMint,
                requestWithdrawVaultReceipt,
                true
              ),
              requestWithdrawVaultReceipt,
              vaultLpMint
            )
          );

          ixs.push(
            await vc.createRequestWithdrawVaultIx(
              {
                amount: inputAmountBN,
                isAmountInLp: false,
                isWithdrawAll:
                  inputAmountBN.toString() === userAssetAmount.toString(),
              },
              {
                payer: user,
                userTransferAuthority: user,
                vault: vaultPk,
              }
            )
          );
        } else if (userWithdrawRequest.withdrawableFromTs > Date.now() / 1000) {
          ixs.push(
            await vc.createCancelRequestWithdrawVaultIx({
              userTransferAuthority: user,
              vault: vaultPk,
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
            await vc.createWithdrawVaultIx({
              userTransferAuthority: user,
              vault: vaultPk,
              vaultAssetMint: assetMint,
              assetTokenProgram: TOKEN_PROGRAM_ID,
            })
          );
        }

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
            oneDayApy={vault.apy.oneDay}
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
            vaultAPY={vault.apy}
            orgName={vault.org.name}
            orgDescription={vault.org.description}
            orgImage={vault.org.logo}
            orgSocial={vault.org.social}
            orgWeb={vault.org.web}
            feeConfiguration={vault.feeConfiguration}
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
          />
        </div>
      </div>
    </div>
  );
}

function useRefreshVaultData(initialData: VaultInformation, pubkey: string) {
  const [vaultData, setVaultData] = useState<VaultInformation>(initialData);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Update state when initialData changes (e.g., when the server sends new data)
    setVaultData(initialData);
  }, [initialData]);

  useEffect(() => {
    let isMounted = true;

    const fetchFreshData = async () => {
      try {
        setIsLoading(true);
        const baseUrl = process.env.NEXT_PUBLIC_API_URL;
        const res = await fetch(
          `${baseUrl}/vault/${pubkey}?_=${Date.now()}`
        );

        if (!res.ok) throw new Error("Failed to fetch fresh data");

        const { vault } = await res.json();

        if (isMounted) {
          setVaultData(vault);
        }
      } catch (error) {
        console.error("Error fetching fresh vault data:", error);
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    // Fetch fresh data once the component is mounted
    fetchFreshData();

    return () => {
      isMounted = false;
    };
  }, [pubkey]);

  return { vaultData, isLoading };
}
