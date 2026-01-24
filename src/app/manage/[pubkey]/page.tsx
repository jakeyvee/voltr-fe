"use client";

import React, { useEffect, useState, useMemo } from "react";
import { Tab, TabGroup, TabList, TabPanel, TabPanels } from "@headlessui/react";
import { UnifiedWalletButton, useWallet } from "@jup-ag/wallet-adapter";
import { useParams } from "next/navigation";
import {
  PublicKey,
  VersionedTransaction,
  TransactionMessage,
  TransactionInstruction,
} from "@solana/web3.js";
import { BN } from "@coral-xyz/anchor";
import { VoltrClient, VaultConfigField } from "@voltr/vault-sdk";
import { createConnection } from "@/lib/publicConnection";
import { toast } from "react-toastify";
import {
  ArrowLeftIcon,
  PencilSquareIcon,
  ShieldCheckIcon,
  AdjustmentsHorizontalIcon,
  InformationCircleIcon,
  PuzzlePieceIcon,
  PlusIcon,
  TrashIcon,
  CloudArrowUpIcon,
} from "@heroicons/react/24/outline";
import Link from "next/link";

const AVAILABLE_ADAPTORS = [
  { name: "Drift", pid: "EBN93eXs5fHGBABuajQqdsKRkCgaqtJa8vEFD6vKXiP" },
  { name: "Jupiter", pid: "EW35URAx3LiM13fFK3QxAXfGemHso9HWPixrv7YDY4AM" },
  { name: "Kamino", pid: "to6Eti9CsC5FGkAtqiPphvKD2hiQiLsS8zWiDBqBPKR" },
  { name: "Trustful", pid: "3pnpK9nrs1R65eMV1wqCXkDkhSgN18xb1G5pgYPwoZjJ" },
];

export default function UpdateVaultPage() {
  const { pubkey } = useParams();
  const wallet = useWallet();
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [vaultAccount, setVaultAccount] = useState<any>(null);
  const [installedAdaptors, setInstalledAdaptors] = useState<string[]>([]);

  // --- Editable Form State ---
  const [maxCap, setMaxCap] = useState<string>("");
  const [waitPeriod, setWaitPeriod] = useState<string>("");
  const [degradation, setDegradation] = useState<string>("");
  const [mgtFeeManager, setMgtFeeManager] = useState<number>(0);
  const [perfFeeManager, setPerfFeeManager] = useState<number>(0);
  const [mgtFeeAdmin, setMgtFeeAdmin] = useState<number>(0);
  const [perfFeeAdmin, setPerfFeeAdmin] = useState<number>(0);
  const [issuanceFee, setIssuanceFee] = useState<number>(0);
  const [redemptionFee, setRedemptionFee] = useState<number>(0);
  const [managerPk, setManagerPk] = useState<string>("");

  const conn = createConnection();
  const vc = useMemo(() => new VoltrClient(conn), [conn]);
  const vaultPk = useMemo(() => new PublicKey(pubkey as string), [pubkey]);

  useEffect(() => {
    fetchVaultData();
  }, [vaultPk]);

  const fetchVaultData = async () => {
    try {
      setIsLoading(true);
      const [account, adaptorReceipts] = await Promise.all([
        vc.fetchVaultAccount(vaultPk),
        vc.fetchAllAdaptorAddReceiptAccountsOfVault(vaultPk),
      ]);

      setVaultAccount(account);
      setInstalledAdaptors(
        adaptorReceipts.map((r) => r.account.adaptorProgram.toBase58())
      );

      // Pre-fill form
      setMaxCap(account.vaultConfiguration.maxCap.toString());
      setWaitPeriod(
        account.vaultConfiguration.withdrawalWaitingPeriod.toString()
      );
      setDegradation(
        account.vaultConfiguration.lockedProfitDegradationDuration.toString()
      );
      setMgtFeeManager(account.feeConfiguration.managerManagementFee);
      setPerfFeeManager(account.feeConfiguration.managerPerformanceFee);
      setMgtFeeAdmin(account.feeConfiguration.adminManagementFee);
      setPerfFeeAdmin(account.feeConfiguration.adminPerformanceFee);
      setIssuanceFee(account.feeConfiguration.issuanceFee);
      setRedemptionFee(account.feeConfiguration.redemptionFee);
      setManagerPk(account.manager.toBase58());
    } catch (e) {
      toast.error("Failed to fetch vault data");
    } finally {
      setIsLoading(false);
    }
  };

  const serializeValue = (field: VaultConfigField, value: any): Buffer => {
    switch (field) {
      case VaultConfigField.MaxCap:
      case VaultConfigField.StartAtTs:
      case VaultConfigField.LockedProfitDegradationDuration:
      case VaultConfigField.WithdrawalWaitingPeriod:
        return new BN(value).toArrayLike(Buffer, "le", 8);
      case VaultConfigField.ManagerPerformanceFee:
      case VaultConfigField.AdminPerformanceFee:
      case VaultConfigField.ManagerManagementFee:
      case VaultConfigField.AdminManagementFee:
      case VaultConfigField.RedemptionFee:
      case VaultConfigField.IssuanceFee:
        const buf = Buffer.alloc(2);
        buf.writeUInt16LE(value, 0);
        return buf;
      case VaultConfigField.Manager:
        return new PublicKey(value).toBuffer();
      default:
        throw new Error("Unknown field");
    }
  };

  const handleAdaptorAction = async (
    programId: string,
    action: "add" | "remove"
  ) => {
    if (!wallet.publicKey) return;
    setIsUpdating(true);

    try {
      const adaptorProgram = new PublicKey(programId);
      let ix;

      if (action === "add") {
        ix = await vc.createAddAdaptorIx({
          vault: vaultPk,
          admin: wallet.publicKey,
          payer: wallet.publicKey,
          adaptorProgram,
        });
      } else {
        ix = await vc.createRemoveAdaptorIx({
          vault: vaultPk,
          admin: wallet.publicKey,
          adaptorProgram,
        });
      }

      const { blockhash } = await conn.getLatestBlockhash();
      const messageV0 = new TransactionMessage({
        payerKey: wallet.publicKey,
        recentBlockhash: blockhash,
        instructions: [ix],
      }).compileToV0Message();

      const transaction = new VersionedTransaction(messageV0);
      const txSig = await wallet.sendTransaction(transaction, conn);
      await conn.confirmTransaction(txSig, "confirmed");

      toast.success(
        `Adaptor ${action === "add" ? "added" : "removed"} successfully!`
      );
      fetchVaultData(); // Refresh list
    } catch (e: any) {
      toast.error(`Action failed: ${e.message}`);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleUpdate = async () => {
    if (!wallet.publicKey || !vaultAccount) return;
    if (wallet.publicKey.toBase58() !== vaultAccount.admin.toBase58()) {
      toast.error("Only the Vault Admin can perform this action");
      return;
    }

    setIsUpdating(true);
    try {
      const instructions: TransactionInstruction[] = [];
      const vaultLpMint = vc.findVaultLpMint(vaultPk);

      // Helper to push update if changed
      const pushUpdateIfChanged = async (
        field: VaultConfigField,
        newValue: any,
        currentValue: any
      ) => {
        if (newValue.toString() !== currentValue.toString()) {
          const data = serializeValue(field, newValue);
          const ix = await vc.createUpdateVaultConfigIx(field, data, {
            vault: vaultPk,
            admin: wallet.publicKey!,
            vaultLpMint,
          });
          instructions.push(ix);
        }
      };

      // Check all fields
      await pushUpdateIfChanged(
        VaultConfigField.MaxCap,
        maxCap,
        vaultAccount.vaultConfiguration.maxCap
      );
      await pushUpdateIfChanged(
        VaultConfigField.WithdrawalWaitingPeriod,
        waitPeriod,
        vaultAccount.vaultConfiguration.withdrawalWaitingPeriod
      );
      await pushUpdateIfChanged(
        VaultConfigField.LockedProfitDegradationDuration,
        degradation,
        vaultAccount.vaultConfiguration.lockedProfitDegradationDuration
      );
      await pushUpdateIfChanged(
        VaultConfigField.ManagerManagementFee,
        mgtFeeManager,
        vaultAccount.feeConfiguration.managerManagementFee
      );
      await pushUpdateIfChanged(
        VaultConfigField.ManagerPerformanceFee,
        perfFeeManager,
        vaultAccount.feeConfiguration.managerPerformanceFee
      );
      await pushUpdateIfChanged(
        VaultConfigField.AdminManagementFee,
        mgtFeeAdmin,
        vaultAccount.feeConfiguration.adminManagementFee
      );
      await pushUpdateIfChanged(
        VaultConfigField.AdminPerformanceFee,
        perfFeeAdmin,
        vaultAccount.feeConfiguration.adminPerformanceFee
      );
      await pushUpdateIfChanged(
        VaultConfigField.IssuanceFee,
        issuanceFee,
        vaultAccount.feeConfiguration.issuanceFee
      );
      await pushUpdateIfChanged(
        VaultConfigField.RedemptionFee,
        redemptionFee,
        vaultAccount.feeConfiguration.redemptionFee
      );
      await pushUpdateIfChanged(
        VaultConfigField.Manager,
        managerPk,
        vaultAccount.manager
      );

      if (instructions.length === 0) {
        toast.info("No changes detected");
        return;
      }

      const { blockhash } = await conn.getLatestBlockhash();
      const messageV0 = new TransactionMessage({
        payerKey: wallet.publicKey,
        recentBlockhash: blockhash,
        instructions,
      }).compileToV0Message();

      const transaction = new VersionedTransaction(messageV0);
      const txSig = await wallet.sendTransaction(transaction, conn);
      await conn.confirmTransaction(txSig, "confirmed");

      toast.success(`Updated ${instructions.length} fields successfully!`);
      fetchVaultData(); // Refresh
    } catch (e: any) {
      toast.error(`Update failed: ${e.message}`);
    } finally {
      setIsUpdating(false);
    }
  };

  if (isLoading)
    return (
      <div className="min-h-screen flex items-center justify-center text-ranger-400 animate-pulse">
        Loading Vault Configuration...
      </div>
    );

  return (
    <div className="min-h-[calc(100vh-15.5rem)] max-w-6xl mx-auto px-6 py-6">
      <div className="flex items-center justify-between mb-8">
        <div>
          <Link
            href="/manage"
            className="flex items-center text-sm text-ranger-400 hover:text-ranger-300 transition mb-2"
          >
            <ArrowLeftIcon className="w-4 h-4 mr-1" /> Back to Manage
          </Link>
          <h1 className="text-3xl font-bold text-white tracking-tight">
            Configure Vault
          </h1>
          <p className="text-gray-400 mt-1 font-mono text-sm">
            {vaultPk.toBase58()}
          </p>
        </div>
        <div className="bg-ranger-500/10 border border-ranger-500/20 px-4 py-2 rounded-lg hidden md:flex items-center gap-2">
          <ShieldCheckIcon className="w-5 h-5 text-ranger-500" />
          <span className="text-ranger-500 text-sm font-medium">
            Verified Admin Session
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Settings Columns */}
        <div className="lg:col-span-8">
          <TabGroup>
            <TabList className="flex gap-4 mb-6 border-b border-white/5">
              <Tab
                className={({ selected }) => `
        pb-4 text-sm font-medium outline-none transition-all border-b-2
        ${
          selected
            ? "text-ranger-400 border-ranger-400"
            : "text-gray-500 border-transparent hover:text-gray-300"
        }
      `}
              >
                <h3 className="flex items-center gap-3 text-lg">
                  <AdjustmentsHorizontalIcon className="w-5 h-5" />
                  Vault Config
                </h3>
              </Tab>
              <Tab
                className={({ selected }) => `
        pb-4 text-sm font-medium outline-none transition-all border-b-2
        ${
          selected
            ? "text-ranger-400 border-ranger-400"
            : "text-gray-500 border-transparent hover:text-gray-300"
        }
      `}
              >
                <h3 className="flex items-center gap-3 text-lg">
                  <PuzzlePieceIcon className="w-5 h-5" />
                  Manage Adaptors
                </h3>
              </Tab>
            </TabList>
            <TabPanels>
              <TabPanel className="space-y-6">
                <SectionCard
                  title="Global Parameters"
                  icon={
                    <AdjustmentsHorizontalIcon className="w-5 h-5 text-ranger-400" />
                  }
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Field
                      label="Max Capacity (Raw)"
                      current={vaultAccount.vaultConfiguration.maxCap.toString()}
                      value={maxCap}
                      onChange={setMaxCap}
                    />
                    <Field
                      label="Manager Authority"
                      current={vaultAccount.manager.toBase58()}
                      value={managerPk}
                      onChange={setManagerPk}
                    />
                    <Field
                      label="Waiting Period (Sec)"
                      current={vaultAccount.vaultConfiguration.withdrawalWaitingPeriod.toString()}
                      value={waitPeriod}
                      onChange={setWaitPeriod}
                    />
                    <Field
                      label="Locked Profit Degradation (Sec)"
                      current={vaultAccount.vaultConfiguration.lockedProfitDegradationDuration.toString()}
                      value={degradation}
                      onChange={setDegradation}
                    />
                  </div>
                </SectionCard>

                <SectionCard
                  title="Fee Structure"
                  icon={
                    <PencilSquareIcon className="w-5 h-5 text-orange-400" />
                  }
                >
                  <div className="space-y-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <Field
                        label="Manager Mgt Fee (BPS)"
                        current={
                          vaultAccount.feeConfiguration.managerManagementFee
                        }
                        value={mgtFeeManager}
                        onChange={setMgtFeeManager}
                        type="number"
                      />
                      <Field
                        label="Manager Perf Fee (BPS)"
                        current={
                          vaultAccount.feeConfiguration.managerPerformanceFee
                        }
                        value={perfFeeManager}
                        onChange={setPerfFeeManager}
                        type="number"
                      />
                      <Field
                        label="Admin Mgt Fee (BPS)"
                        current={
                          vaultAccount.feeConfiguration.adminManagementFee
                        }
                        value={mgtFeeAdmin}
                        onChange={setMgtFeeAdmin}
                        type="number"
                      />
                      <Field
                        label="Admin Perf Fee (BPS)"
                        current={
                          vaultAccount.feeConfiguration.adminPerformanceFee
                        }
                        value={perfFeeAdmin}
                        onChange={setPerfFeeAdmin}
                        type="number"
                      />
                    </div>
                    <div className="pt-4 border-t border-white/5 grid grid-cols-1 md:grid-cols-2 gap-6">
                      <Field
                        label="Issuance Fee (BPS)"
                        current={vaultAccount.feeConfiguration.issuanceFee}
                        value={issuanceFee}
                        onChange={setIssuanceFee}
                        type="number"
                      />
                      <Field
                        label="Redemption Fee (BPS)"
                        current={vaultAccount.feeConfiguration.redemptionFee}
                        value={redemptionFee}
                        onChange={setRedemptionFee}
                        type="number"
                      />
                    </div>
                  </div>
                </SectionCard>
              </TabPanel>
              <TabPanel>
                <SectionCard
                  title="Available Adaptors"
                  icon={
                    <CloudArrowUpIcon className="w-5 h-5 text-ranger-400" />
                  }
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {AVAILABLE_ADAPTORS.map((adaptor) => {
                      const isInstalled = installedAdaptors.includes(
                        adaptor.pid
                      );
                      return (
                        <div
                          key={adaptor.pid}
                          className="bg-phantom/40 border border-white/5 rounded-xl p-5 flex items-center justify-between group hover:border-ranger-500/30 transition-all"
                        >
                          <div className="flex flex-col">
                            <span className="text-white font-semibold">
                              {adaptor.name} Adaptor
                            </span>
                            <span className="text-[10px] text-gray-500 font-mono mt-1">
                              {adaptor.pid.slice(0, 6)}...
                              {adaptor.pid.slice(-6)}
                            </span>
                          </div>

                          {isInstalled ? (
                            <button
                              onClick={() =>
                                handleAdaptorAction(adaptor.pid, "remove")
                              }
                              disabled={isUpdating}
                              className="p-2.5 rounded-lg bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white transition-all"
                              title="Remove Adaptor"
                            >
                              <TrashIcon className="w-5 h-5" />
                            </button>
                          ) : (
                            <button
                              onClick={() =>
                                handleAdaptorAction(adaptor.pid, "add")
                              }
                              disabled={isUpdating}
                              className="p-2.5 rounded-lg bg-ranger-500/10 text-ranger-400 hover:bg-ranger-500 hover:text-white transition-all"
                              title="Add Adaptor"
                            >
                              <PlusIcon className="w-5 h-5" />
                            </button>
                          )}
                        </div>
                      );
                    })}
                  </div>
                  <div className="mt-8 p-4 bg-ranger-500/5 border border-ranger-500/10 rounded-xl flex gap-3">
                    <InformationCircleIcon className="w-5 h-5 text-ranger-400 shrink-0" />
                    <p className="text-xs text-ranger-300/70 leading-relaxed">
                      Adaptors allow the vault to interact with external
                      protocols like Drift or Kamino.
                    </p>
                  </div>
                </SectionCard>
              </TabPanel>
            </TabPanels>
          </TabGroup>
        </div>

        {/* Action Sidebar */}
        <div className="lg:col-span-4">
          <div className="sticky top-10 space-y-4">
            <div className="bg-bgBlack border border-ranger-500/20 rounded-2xl p-6 shadow-xl">
              <h2 className="text-lg font-semibold text-white mb-4">
                Pending Changes
              </h2>
              <div className="bg-black/20 rounded-xl p-4 mb-6">
                <p className="text-xs text-gray-500 uppercase font-bold tracking-widest mb-3">
                  Review
                </p>
                <div className="space-y-2">
                  <ChangeItem
                    label="Max Capacity"
                    from={vaultAccount.vaultConfiguration.maxCap.toString()}
                    to={maxCap}
                  />
                  <ChangeItem
                    label="Manager Authority"
                    from={vaultAccount.manager.toBase58()}
                    to={managerPk}
                  />
                  <ChangeItem
                    label="Withdraw Waiting Period"
                    from={vaultAccount.vaultConfiguration.withdrawalWaitingPeriod.toString()}
                    to={waitPeriod}
                  />
                  <ChangeItem
                    label="Locked Profit Degradation"
                    from={vaultAccount.vaultConfiguration.lockedProfitDegradationDuration.toString()}
                    to={degradation}
                    suffix=" Sec"
                  />
                  <ChangeItem
                    label="Manager Mgt Fee"
                    from={vaultAccount.feeConfiguration.managerManagementFee}
                    to={mgtFeeManager}
                    suffix=" BPS"
                  />
                  <ChangeItem
                    label="Manager Perf Fee"
                    from={vaultAccount.feeConfiguration.managerPerformanceFee}
                    to={perfFeeManager}
                    suffix=" BPS"
                  />
                  <ChangeItem
                    label="Admin Perf Fee"
                    from={vaultAccount.feeConfiguration.adminPerformanceFee}
                    to={perfFeeAdmin}
                    suffix=" BPS"
                  />
                  <ChangeItem
                    label="Admin Mgt Fee"
                    from={vaultAccount.feeConfiguration.adminManagementFee}
                    to={mgtFeeAdmin}
                    suffix=" BPS"
                  />
                  <ChangeItem
                    label="Issuance Fee"
                    from={vaultAccount.feeConfiguration.issuanceFee}
                    to={issuanceFee}
                    suffix=" BPS"
                  />
                  <ChangeItem
                    label="Redemption Fee"
                    from={vaultAccount.feeConfiguration.redemptionFee}
                    to={redemptionFee}
                    suffix=" BPS"
                  />
                </div>
              </div>
              {wallet && wallet.connected ? (
                <button
                  onClick={handleUpdate}
                  disabled={isUpdating}
                  className="btn w-full bg-gradient-to-t from-ranger-600 to-ranger-500 text-white shadow-inner hover:bg-gradient-to-b"
                >
                  {isUpdating ? (
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
                      Updating...
                    </div>
                  ) : (
                    "Commit Changes"
                  )}
                </button>
              ) : (
                <UnifiedWalletButton
                  buttonClassName="btn !w-full !bg-gradient-to-t !from-ranger-500 !to-ranger-400 !bg-[length:100%_100%] !bg-[bottom] !text-gray-900 !shadow-[inset_0px_1px_0px_0px_theme(colors.white/.16)] hover:!bg-[length:100%_150%]"
                  currentUserClassName="btn !w-full !bg-gradient-to-t !from-ranger-500 !to-ranger-400 !bg-[length:100%_100%] !bg-[bottom] !text-gray-900 !shadow-[inset_0px_1px_0px_0px_theme(colors.white/.16)] hover:!bg-[length:100%_150%]"
                />
              )}
            </div>

            <div className="p-4 bg-ranger-500/5 border border-ranger-500/10 rounded-xl flex gap-3">
              <InformationCircleIcon className="w-5 h-5 text-ranger-400 shrink-0" />
              <p className="text-xs text-ranger-300/70 leading-relaxed">
                If multiple fields are changed, the changes are batched
                atomically.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// --- Internal Helper Components ---

const SectionCard = ({ title, children, icon }: any) => (
  <div className="bg-bgBlack/50 border border-white/5 rounded-2xl p-8 backdrop-blur-sm">
    <div className="flex items-center gap-3 mb-8">
      <div className="p-2 bg-phantom rounded-lg">{icon}</div>
      <h2 className="text-xl font-bold text-gray-100">{title}</h2>
    </div>
    {children}
  </div>
);

const Field = ({ label, current, value, onChange, type = "text" }: any) => {
  const isChanged = current.toString() !== value.toString();
  return (
    <div className="flex flex-col gap-2">
      <div className="flex justify-between items-center">
        <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
          {label}
        </label>
        {isChanged && (
          <span className="text-[10px] bg-ranger-500/20 text-ranger-400 px-2 py-0.5 rounded-full font-bold">
            CHANGED
          </span>
        )}
      </div>
      <input
        type={type}
        className={`bg-phantom border ${
          isChanged ? "border-ranger-500/50" : "border-gray-700"
        } rounded-lg px-4 py-2.5 text-white outline-none focus:border-ranger-500 transition-all`}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
      <div className="text-[11px] text-gray-600 flex items-center gap-1 italic">
        <span>Current:</span>
        <span className="font-mono">{current.toString()}</span>
      </div>
    </div>
  );
};

const ChangeItem = ({ label, from, to, suffix = "" }: any) => {
  if (from.toString() === to.toString()) return null;
  return (
    <div className="flex flex-col text-xs border-l-2 border-ranger-500 pl-3 py-1">
      <span className="text-gray-500">{label}</span>
      <div className="flex items-center gap-2 text-white">
        <span className="line-through text-gray-600">
          {from}
          {suffix}
        </span>
        <span>→</span>
        <span className="text-ranger-400 font-bold">
          {to}
          {suffix}
        </span>
      </div>
    </div>
  );
};
