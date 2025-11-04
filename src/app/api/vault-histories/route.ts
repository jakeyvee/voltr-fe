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
import { bs58 } from "@coral-xyz/anchor/dist/cjs/utils/bytes";
import { CompiledInstruction } from "@solana/web3.js";

const INSTRUCTION_DISCRIMINATORS = new Map<string, string>([
  ["161,145,203,248,211,202,203,67", "add_adaptor"],
  ["178,116,38,9,23,20,91,154", "calibrate_high_water_mark"],
  ["231,54,14,6,223,124,127,238", "cancel_request_withdraw_vault"],
  ["56,247,170,246,89,221,134,200", "close_strategy"],
  ["148,193,160,116,87,25,123,103", "create_lp_metadata"],
  ["246,82,57,226,131,222,253,249", "deposit_strategy"],
  ["126,224,21,255,228,53,117,33", "deposit_vault"],
  ["119,33,54,52,194,8,211,239", "direct_withdraw_strategy"],
  ["32,59,42,128,246,73,255,47", "harvest_fee"],
  ["149,56,57,46,105,182,61,208", "init_or_update_protocol"],
  ["248,207,228,15,13,191,43,58", "initialize_direct_withdraw_strategy"],
  ["208,119,144,145,178,57,105,252", "initialize_strategy"],
  ["48,191,163,44,71,129,63,164", "initialize_vault"],
  ["161,199,99,22,25,193,61,193", "remove_adaptor"],
  ["248,225,47,22,116,144,23,143", "request_withdraw_vault"],
  ["67,229,185,188,226,11,210,60", "update_vault"],
  ["31,45,162,5,193,217,134,188", "withdraw_strategy"],
  ["135,7,237,120,149,94,95,7", "withdraw_vault"],
  ["122,3,21,222,158,255,238,157", "update_vault_config"],
]);

export interface Transaction {
  transaction: {
    message: {
      accountKeys: string[];
      addressTableLookups: MessageAddressTableLookup[];
      instructions: CompiledInstruction[];
    };
    signatures: string[];
  };
}

function findInstructionByDiscriminator(
  instructionsDataBytes: number[][]
): string[] {
  const instructionArray = [];
  for (const dataBytes of instructionsDataBytes) {
    const key = dataBytes.join(",");
    const instruction = INSTRUCTION_DISCRIMINATORS.get(key);
    if (instruction) {
      instructionArray.push(instruction);
    }
  }
  return instructionArray;
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
  instructions: CompiledInstruction[],
  signature: string
) {
  const { vaultLpMint } = voltrClient.findVaultAddresses(vaultPk);

  const instructionsDataHex = instructions.map((ix) => ix.data);

  const instructionsDataBytes = instructionsDataHex.map((base58String) =>
    Array.from(bs58.decode(base58String)).slice(0, 8)
  );

  const matchedInstructions = findInstructionByDiscriminator(
    instructionsDataBytes
  );

  // Fetch vault and mint data in parallel
  const [vaultAccount, vaultLpMintAccount] = await Promise.all([
    voltrClient.fetchVaultAccount(vaultPk),
    getMint(connection, vaultLpMint, "confirmed"),
  ]);

  const accumulatedLpFees = vaultAccount.feeState.accumulatedLpManagerFees.add(
    vaultAccount.feeState.accumulatedLpAdminFees
  );

  const totalLp = accumulatedLpFees.add(
    new BN(vaultLpMintAccount.supply.toString())
  );

  const { error: insertError } = await supabaseAdmin
    .from("vault_histories")
    .insert({
      vault_pk: vaultPk.toBase58(),
      max_cap: vaultAccount.vaultConfiguration.maxCap.toString(),
      total_value: vaultAccount.asset.totalValue.toString(),
      total_lp: totalLp.toString(),
      unharvested_lp: accumulatedLpFees.toString(),
      withdrawal_waiting_period:
        vaultAccount.vaultConfiguration.withdrawalWaitingPeriod.toString(),
      performance_fee_bps:
        vaultAccount.feeConfiguration.adminPerformanceFee +
        vaultAccount.feeConfiguration.managerPerformanceFee,
      management_fee_bps:
        vaultAccount.feeConfiguration.adminManagementFee +
        vaultAccount.feeConfiguration.managerManagementFee,
      issuance_fee_bps: vaultAccount.feeConfiguration.issuanceFee,
      redemption_fee_bps: vaultAccount.feeConfiguration.redemptionFee,
      updated_tx: signature,
      tx_type: matchedInstructions,
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
        if (
          !tx.transaction?.message?.accountKeys ||
          !tx.transaction?.message?.instructions
        ) {
          return;
        }

        // Initialize connection and client once per transaction
        const connection = createConnection();
        const vc = new VoltrClient(connection, undefined, {
          commitment: "confirmed",
        });

        const accountsKeys: string[] = [];
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
              tx.transaction.message.instructions,
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
