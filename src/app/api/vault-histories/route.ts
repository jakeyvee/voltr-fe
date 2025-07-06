import { createConnection } from "@/lib/publicConnection";
import { supabaseAdmin } from "@/lib/supabase";
import { validateAuthHeader } from "@/lib/validate";
import { getMint } from "@solana/spl-token";
import {
  Connection,
  MessageAddressTableLookup,
  PublicKey,
} from "@solana/web3.js";
import { VoltrClient } from "@voltr/vault-sdk";
import { NextResponse } from "next/server";
import { BN } from "@coral-xyz/anchor";
import { getWritableAccountKeys } from "@/lib/addressLookupUtils";
import { PROTOCOL_STATE_PUBKEY } from "@/lib/Constants";

export interface Transaction {
  transaction: {
    message: {
      accountKeys: string[];
      addressTableLookups: MessageAddressTableLookup[];
    };
    signatures: string[];
  };
}

async function fetchVaultsByAccountKeys(accountKeys: string[]) {
  const { data, error } = await supabaseAdmin
    .from("vaults")
    .select("pk")
    .in("pk", accountKeys);

  if (error || !data) {
    throw new Error(`Error fetching vaults: ${error?.message}`);
  }

  return data;
}

async function updateVaultHistory(
  connection: Connection,
  voltrClient: VoltrClient,
  vaultPk: PublicKey,
  signature: string
) {
  const { vaultLpMint } = voltrClient.findVaultAddresses(vaultPk);

  // Fetch vault and mint data in parallel
  const [vaultAccount, vaultLpMintAccount] = await Promise.all([
    voltrClient.fetchVaultAccount(vaultPk),
    getMint(connection, vaultLpMint, "confirmed"),
  ]);

  const accumulatedLpFees = vaultAccount.feeState.accumulatedLpManagerFees.add(
    vaultAccount.feeState.accumulatedLpAdminFees
  );

  const totalLp = accumulatedLpFees
    .add(new BN(vaultLpMintAccount.supply.toString()))
    .toNumber();

  const { error: insertError } = await supabaseAdmin
    .from("vault_histories")
    .insert({
      vault_pk: vaultPk.toBase58(),
      max_cap: vaultAccount.vaultConfiguration.maxCap.toNumber(),
      total_value: vaultAccount.asset.totalValue.toNumber(),
      total_lp: totalLp,
      unharvested_lp: accumulatedLpFees.toNumber(),
      withdrawal_waiting_period:
        vaultAccount.vaultConfiguration.withdrawalWaitingPeriod.toNumber(),
      performance_fee_bps:
        vaultAccount.feeConfiguration.adminPerformanceFee +
        vaultAccount.feeConfiguration.managerPerformanceFee,
      management_fee_bps:
        vaultAccount.feeConfiguration.adminManagementFee +
        vaultAccount.feeConfiguration.managerManagementFee,
      issuance_fee_bps: vaultAccount.feeConfiguration.issuanceFee,
      redemption_fee_bps: vaultAccount.feeConfiguration.redemptionFee,
      updated_tx: signature,
    });

  if (insertError) {
    throw new Error(`Error inserting vault history: ${insertError.message}`);
  }
}

export async function POST(req: Request) {
  try {
    // Validate authentication
    await validateAuthHeader(req.headers.get("authorization"));

    const transactions: Transaction[] = await req.json();

    // Process each transaction
    await Promise.all(
      transactions.map(async (tx) => {
        // Skip if transaction doesn't have required data
        if (!tx.transaction?.message?.accountKeys) {
          return;
        }

        // Initialize connection and client once per transaction
        const connection = createConnection();
        const vc = new VoltrClient(connection);

        let accountsKeys: string[] = [];
        accountsKeys.push(...tx.transaction.message.accountKeys);

        if (
          !accountsKeys.includes(PROTOCOL_STATE_PUBKEY.toBase58()) &&
          tx.transaction.message.addressTableLookups &&
          tx.transaction.message.addressTableLookups.length > 0
        ) {
          const writableAccountKeys = await getWritableAccountKeys(
            tx.transaction.message.addressTableLookups.map(
              (addressTableLookup) =>
                new PublicKey(addressTableLookup.accountKey)
            ),
            tx.transaction.message.addressTableLookups.map(
              (addressTableLookup) => addressTableLookup.writableIndexes
            ),
            connection
          );
          accountsKeys.push(...writableAccountKeys.flat());
        }

        const vaults = await fetchVaultsByAccountKeys(accountsKeys);

        // Update histories for each vault
        await Promise.all(
          vaults.map((vault) =>
            updateVaultHistory(
              connection,
              vc,
              new PublicKey(vault.pk),
              tx.transaction.signatures[0]
            )
          )
        );
      })
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error processing webhook:", error);
    return NextResponse.json(
      { error: "Failed to process webhook" },
      { status: 500 }
    );
  }
}
