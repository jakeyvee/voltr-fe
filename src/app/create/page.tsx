"use client";

import React, { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { UnifiedWalletButton, useWallet } from "@jup-ag/wallet-adapter";
import {
  PublicKey,
  Keypair,
  VersionedTransaction,
  TransactionMessage,
} from "@solana/web3.js";
import { BN } from "@coral-xyz/anchor";
import { VoltrClient } from "@voltr/vault-sdk";
import { createConnection } from "@/lib/publicConnection";
import { toast } from "react-toastify";
import {
  ArrowLeftIcon,
  RocketLaunchIcon,
  ShieldCheckIcon,
  AdjustmentsHorizontalIcon,
  SparklesIcon,
} from "@heroicons/react/24/outline";
import Link from "next/link";

export default function CreateVaultPage() {
  const wallet = useWallet();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  // --- Form State ---
  const [vaultName, setVaultName] = useState<string | undefined>();
  const [vaultDesc, setVaultDesc] = useState<string | undefined>();
  const [assetMint, setAssetMint] = useState<string | undefined>();
  const [managerPk, setManagerPk] = useState<string | undefined>();

  // Config
  const [maxCap, setMaxCap] = useState<number | undefined>(undefined);
  const [waitPeriod, setWaitPeriod] = useState<number | undefined>(undefined);
  const [degradation, setDegradation] = useState<number | undefined>(undefined);

  // Fees (BPS)
  const [managerManagementFee, setManagerManagementFee] = useState<
    number | undefined
  >(undefined);
  const [managerPerformanceFee, setManagerPerformanceFee] = useState<
    number | undefined
  >(undefined);
  const [adminManagementFee, setAdminManagementFee] = useState<
    number | undefined
  >(undefined);
  const [adminPerformanceFee, setAdminPerformanceFee] = useState<
    number | undefined
  >(undefined);
  const [issuanceFee, setIssuanceFee] = useState<number | undefined>(undefined);
  const [redemptionFee, setRedemptionFee] = useState<number | undefined>(
    undefined
  );

  // Metadata
  const [lpName, setLpName] = useState<string | undefined>(undefined);
  const [lpSymbol, setLpSymbol] = useState<string | undefined>(undefined);
  const [lpUri, setLpUri] = useState<string | undefined>(undefined);

  const isAllFieldsFilled = useMemo(() => {
    return (
      vaultName !== undefined &&
      vaultDesc !== undefined &&
      assetMint !== undefined &&
      managerPk !== undefined &&
      managerManagementFee !== undefined &&
      managerPerformanceFee !== undefined &&
      adminManagementFee !== undefined &&
      adminPerformanceFee !== undefined &&
      issuanceFee !== undefined &&
      redemptionFee !== undefined &&
      maxCap !== undefined &&
      waitPeriod !== undefined &&
      degradation !== undefined &&
      lpName !== undefined &&
      lpSymbol !== undefined &&
      lpUri !== undefined
    );
  }, [
    vaultName,
    vaultDesc,
    assetMint,
    managerPk,
    managerManagementFee,
    managerPerformanceFee,
    adminManagementFee,
    adminPerformanceFee,
    issuanceFee,
    redemptionFee,
    maxCap,
    waitPeriod,
    degradation,
    lpName,
    lpSymbol,
    lpUri,
  ]);

  const handleCreate = async () => {
    if (!wallet.publicKey) {
      toast.error("Please connect your wallet");
      return;
    }

    setIsLoading(true);
    const conn = createConnection();
    const vc = new VoltrClient(conn);

    try {
      const vaultKp = Keypair.generate();
      const vaultAddress = vaultKp.publicKey;

      if (
        vaultName === undefined ||
        vaultDesc === undefined ||
        assetMint === undefined ||
        managerPk === undefined ||
        managerManagementFee === undefined ||
        managerPerformanceFee === undefined ||
        adminManagementFee === undefined ||
        adminPerformanceFee === undefined ||
        issuanceFee === undefined ||
        redemptionFee === undefined ||
        maxCap === undefined ||
        waitPeriod === undefined ||
        degradation === undefined ||
        lpName === undefined ||
        lpSymbol === undefined ||
        lpUri === undefined
      ) {
        toast.error("Please fill in all fields");
        return;
      }

      const config = {
        maxCap: new BN(Number(maxCap)),
        startAtTs: new BN(0),
        managerManagementFee,
        managerPerformanceFee,
        adminManagementFee,
        adminPerformanceFee,
        lockedProfitDegradationDuration: new BN(degradation),
        redemptionFee: redemptionFee,
        issuanceFee: issuanceFee,
        withdrawalWaitingPeriod: new BN(waitPeriod),
      };

      const vaultParams = {
        config,
        name: vaultName,
        description: vaultDesc,
      };

      const initIx = await vc.createInitializeVaultIx(vaultParams, {
        vault: vaultAddress,
        vaultAssetMint: new PublicKey(assetMint),
        admin: wallet.publicKey,
        manager: new PublicKey(managerPk || wallet.publicKey.toBase58()),
        payer: wallet.publicKey,
      });

      const metadataIx = await vc.createCreateLpMetadataIx(
        { name: lpName, symbol: lpSymbol, uri: lpUri },
        {
          payer: wallet.publicKey,
          admin: wallet.publicKey,
          vault: vaultAddress,
        }
      );

      const { blockhash } = await conn.getLatestBlockhash();
      const messageV0 = new TransactionMessage({
        payerKey: wallet.publicKey,
        recentBlockhash: blockhash,
        instructions: [initIx, metadataIx],
      }).compileToV0Message();

      const transaction = new VersionedTransaction(messageV0);
      transaction.sign([vaultKp]); // Sign with the new vault account

      const txSig = await wallet.sendTransaction(transaction, conn);
      await conn.confirmTransaction(txSig, "confirmed");

      toast.success(
        "Vault Created Successfully! Redirecting to admin dashboard..."
      );
      await new Promise((resolve) => setTimeout(resolve, 3000));
      router.push(`/manage/${vaultAddress.toBase58()}`);
    } catch (error: any) {
      console.error(error);
      toast.error(`Creation failed: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-15.5rem)] max-w-6xl mx-auto px-6 py-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <Link
            href="/manage"
            className="flex items-center text-sm text-ranger-400 hover:text-ranger-300 transition mb-2"
          >
            <ArrowLeftIcon className="w-4 h-4 mr-1" /> Back to Manage
          </Link>
          <h1 className="text-3xl font-bold text-white tracking-tight">
            Launch New Vault
          </h1>
          <p className="text-gray-400 mt-1">
            Deploy institutional-grade yield infrastructure on Solana.
          </p>
        </div>
        <div className="hidden md:block">
          <RocketLaunchIcon className="w-12 h-12 text-ranger-500/20" />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Form Area */}
        <div className="lg:col-span-2 space-y-6">
          {/* Section 1: Identity */}
          <Card
            title="Vault Identity"
            icon={<SparklesIcon className="w-5 h-5 text-ranger-400" />}
          >
            <div className="grid grid-cols-1 gap-4">
              <Input
                label="Vault Name"
                placeholder="e.g. Super Stable USDC (max 32 characters)"
                value={vaultName}
                onChange={setVaultName}
              />
              <TextArea
                label="Description"
                placeholder="Short description of the strategy... (max 64 characters)"
                value={vaultDesc}
                onChange={setVaultDesc}
              />
            </div>
          </Card>

          {/* Section 2: Asset Details */}
          <Card
            title="Asset Configuration"
            icon={<ShieldCheckIcon className="w-5 h-5 text-ranger-400" />}
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <div className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Admin Authority
                </div>
                <input
                  type="text"
                  className="bg-phantom border border-gray-700 rounded-lg px-4 py-2.5 text-white outline-none focus:border-ranger-500 transition-colors"
                  placeholder={"Wallet Not Connected"}
                  value={wallet?.publicKey?.toBase58()}
                  disabled
                />
              </div>
              <Input
                label="Manager Authority"
                placeholder="Manager Public Key"
                value={managerPk}
                onChange={setManagerPk}
              />
              <Input
                label="Base Asset Mint"
                placeholder="Address..."
                value={assetMint}
                onChange={setAssetMint}
              />
            </div>
          </Card>

          {/* Section 3: Risk & Performance */}
          <Card
            title="Parameters & Fees"
            icon={
              <AdjustmentsHorizontalIcon className="w-5 h-5 text-orange-400" />
            }
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Max Capacity (Raw Lamports)"
                type="number"
                placeholder="1000000 = 1 USDC "
                value={maxCap}
                onChange={setMaxCap}
              />
              <Input
                label="Withdraw Waiting Period (Sec)"
                type="number"
                placeholder="0 = Instant, 86400 = 1 day"
                value={waitPeriod}
                onChange={setWaitPeriod}
              />
              <Input
                label="Locked Profit Degradation Period (Sec)"
                type="number"
                placeholder="0 = Instant, 86400 = 1 day"
                value={degradation}
                onChange={setDegradation}
              />
              <Input
                label="Performance Fee for Admin (BPS)"
                placeholder="500 = 5% (max 100%)"
                type="number"
                value={adminPerformanceFee}
                onChange={(v: any) => setAdminPerformanceFee(Number(v))}
              />
              <Input
                label="Management Fee for Admin (BPS)"
                placeholder="500 = 5% (max 100%)"
                type="number"
                value={adminManagementFee}
                onChange={(v: any) => setAdminManagementFee(Number(v))}
              />
              <Input
                label="Performance Fee for Manager (BPS)"
                placeholder="500 = 5% (max 100%)"
                type="number"
                value={managerPerformanceFee}
                onChange={(v: any) => setManagerPerformanceFee(Number(v))}
              />
              <Input
                label="Management Fee for Manager (BPS)"
                placeholder="500 = 5% (max 100%)"
                type="number"
                value={managerManagementFee}
                onChange={(v: any) => setManagerManagementFee(Number(v))}
              />
              <Input
                label="Issuance Fee (BPS)"
                type="number"
                placeholder="500 = 5% (max 100%)"
                value={issuanceFee}
                onChange={(v: any) => setIssuanceFee(Number(v))}
              />
              <Input
                label="Redemption Fee (BPS)"
                type="number"
                placeholder="500 = 5% (max 100%)"
                value={redemptionFee}
                onChange={(v: any) => setRedemptionFee(Number(v))}
              />
            </div>
          </Card>

          {/* Section 4: LP Metadata */}
          <Card
            title="LP Token Metadata"
            icon={<SparklesIcon className="w-5 h-5 text-purple-400" />}
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="LP Name"
                placeholder="Vault LP"
                value={lpName}
                onChange={setLpName}
              />
              <Input
                label="LP Symbol"
                placeholder="vUSDC"
                value={lpSymbol}
                onChange={setLpSymbol}
              />
              <Input
                label="Metadata URI (JSON)"
                placeholder="https://..."
                value={lpUri}
                onChange={setLpUri}
              />
            </div>
          </Card>
        </div>

        {/* Sidebar / Summary */}
        <div className="lg:col-span-1">
          <div className="sticky top-10 space-y-4">
            <div className="bg-bgBlack border border-ranger-500/20 rounded-2xl p-6 shadow-xl">
              <h2 className="text-lg font-semibold text-white mb-4">
                Deployment Summary
              </h2>
              <div className="space-y-3 text-sm mb-4">
                <SummaryItem label="Type" value="Standard Vault" />
                <SummaryItem
                  label="Vault Name"
                  value={vaultName !== undefined ? vaultName : "Not Set"}
                />
                <SummaryItem
                  label="Vault Description"
                  value={vaultDesc !== undefined ? vaultDesc : "Not Set"}
                />
                <SummaryItem
                  label="Base Asset Mint"
                  value={assetMint !== undefined ? assetMint : "Not Set"}
                />
                <SummaryItem
                  label="Manager Authority"
                  value={managerPk !== undefined ? managerPk : "Not Set"}
                />
                <SummaryItem
                  label="Admin Authority"
                  value={wallet?.publicKey?.toBase58() || "Not Set"}
                />
                <SummaryItem
                  label="Max Capacity"
                  value={`${maxCap !== undefined ? maxCap : "Not Set"}`}
                />
                <SummaryItem
                  label="Locked Profit Degradation Duration"
                  value={`${
                    degradation !== undefined ? degradation : "--"
                  } Sec`}
                />
                <SummaryItem
                  label="Withdraw Waiting Period"
                  value={`${waitPeriod !== undefined ? waitPeriod : "--"} Sec`}
                />
                <SummaryItem
                  label="Admin Fee"
                  value={`${
                    adminPerformanceFee !== undefined
                      ? adminPerformanceFee / 100
                      : "--"
                  }% Perf / ${
                    adminManagementFee !== undefined
                      ? adminManagementFee / 100
                      : "--"
                  }% Mgt`}
                />
                <SummaryItem
                  label="Manager Fee"
                  value={`${
                    managerPerformanceFee !== undefined
                      ? managerPerformanceFee / 100
                      : "--"
                  }% Perf / ${
                    managerManagementFee !== undefined
                      ? managerManagementFee / 100
                      : "--"
                  }% Mgt`}
                />
                <SummaryItem
                  label="Issuance Fee"
                  value={`${
                    issuanceFee !== undefined ? issuanceFee / 100 : "--"
                  }%`}
                />
                <SummaryItem
                  label="Redemption Fee"
                  value={`${
                    redemptionFee !== undefined ? redemptionFee / 100 : "--"
                  }%`}
                />
                <SummaryItem
                  label="LP Name"
                  value={lpName !== undefined ? lpName : "Not Set"}
                />
                <SummaryItem
                  label="LP Symbol"
                  value={lpSymbol !== undefined ? lpSymbol : "Not Set"}
                />
                <SummaryItem
                  label="LP URI"
                  value={lpUri !== undefined ? lpUri : "Not Set"}
                />
              </div>
              {wallet && wallet.connected ? (
                <button
                  onClick={handleCreate}
                  disabled={isLoading || !isAllFieldsFilled}
                  className="btn w-full bg-gradient-to-t from-ranger-600 to-ranger-500 text-white shadow-inner hover:bg-gradient-to-b"
                >
                  {isLoading ? (
                    <div className="flex items-center justify-center">
                      <svg
                        className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        />
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        />
                      </svg>
                      Deploying...
                    </div>
                  ) : (
                    "Initialize Vault"
                  )}
                </button>
              ) : (
                <UnifiedWalletButton
                  buttonClassName="btn !w-full !bg-gradient-to-t !from-ranger-500 !to-ranger-400 !bg-[length:100%_100%] !bg-[bottom] !text-gray-900 !shadow-[inset_0px_1px_0px_0px_theme(colors.white/.16)] hover:!bg-[length:100%_150%]"
                  currentUserClassName="btn !w-full !bg-gradient-to-t !from-ranger-500 !to-ranger-400 !bg-[length:100%_100%] !bg-[bottom] !text-gray-900 !shadow-[inset_0px_1px_0px_0px_theme(colors.white/.16)] hover:!bg-[length:100%_150%]"
                />
              )}
            </div>

            <div className="p-4 bg-ranger-500/5 border border-ranger-500/10 rounded-xl">
              <p className="text-xs text-ranger-300/70 leading-relaxed">
                By initializing this vault, you will become the Admin. This
                allows you to update configurations and add adapters later.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// --- Helper UI Components (Styled like the existing theme) ---

const Card = ({
  title,
  children,
  icon,
}: {
  title: string;
  children: React.ReactNode;
  icon: React.ReactNode;
}) => (
  <div className="bg-bgBlack/80 border border-white/5 rounded-2xl p-6 backdrop-blur-sm">
    <div className="flex items-center gap-2 mb-6">
      {icon}
      <h2 className="text-lg font-semibold text-gray-100">{title}</h2>
    </div>
    {children}
  </div>
);

const Input = ({ label, value, onChange, placeholder, type = "text" }: any) => (
  <div className="flex flex-col gap-1.5">
    <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">
      {label}
    </label>
    <input
      type={type}
      className="bg-phantom border border-gray-700 rounded-lg px-4 py-2.5 text-white outline-none focus:border-ranger-500 transition-colors"
      placeholder={placeholder}
      value={value}
      onChange={(e) => onChange(e.target.value)}
    />
  </div>
);

const TextArea = ({ label, value, onChange, placeholder }: any) => (
  <div className="flex flex-col gap-1.5">
    <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">
      {label}
    </label>
    <textarea
      rows={3}
      className="bg-phantom border border-gray-700 rounded-lg px-4 py-2.5 text-white outline-none focus:border-ranger-500 transition-colors"
      placeholder={placeholder}
      value={value}
      onChange={(e) => onChange(e.target.value)}
    />
  </div>
);

const Select = ({ label, options, value, onChange }: any) => (
  <div className="flex flex-col gap-1.5">
    <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">
      {label}
    </label>
    <select
      className="bg-phantom border border-gray-700 rounded-lg px-4 py-2.5 text-white outline-none focus:border-ranger-500 transition-colors"
      value={value}
      onChange={(e) => onChange(e.target.value)}
    >
      {options.map((opt: any) => (
        <option key={opt.value} value={opt.value}>
          {opt.label}
        </option>
      ))}
    </select>
  </div>
);

const SummaryItem = ({ label, value }: { label: string; value: string }) => (
  <div className="flex justify-between items-center border-b border-white/5 pb-2 gap-2">
    <span className="text-gray-400 whitespace-nowrap flex-shrink-0">
      {label}
    </span>
    <span className="text-gray-100 font-medium truncate text-right min-w-0">
      {value}
    </span>
  </div>
);
