import { getWritableAccountKeys } from "@/lib/addressLookupUtils";
import { PROTOCOL_STATE_PUBKEY } from "@/lib/Constants";
import { createConnection } from "@/lib/privateConnection";
import { supabaseAdmin } from "@/lib/supabase";
import { validateAuthHeader } from "@/lib/validate";
import { MessageAddressTableLookup, PublicKey } from "@solana/web3.js";
import { VoltrClient } from "@voltr/vault-sdk";
import { NextResponse } from "next/server";

interface Transaction {
  transaction: {
    message: {
      accountKeys: string[];
      addressTableLookups: MessageAddressTableLookup[];
    };
    signatures: string[];
  };
}

async function fetchAllocationsByAccountKeys(accountKeys: string[]) {
  const { data, error } = await supabaseAdmin
    .from("allocations")
    .select("pk")
    .in("pk", accountKeys);

  if (error || !data) {
    throw new Error(`Error fetching allocations: ${error?.message}`);
  }

  return data;
}

async function updateAllocationHistory(
  voltrClient: VoltrClient,
  allocationPk: PublicKey,
  signature: string
) {
  const strategyInitReceiptAccount =
    await voltrClient.fetchStrategyInitReceiptAccount(allocationPk);
  const allocationPositionValue = strategyInitReceiptAccount.positionValue;

  const { error: insertError } = await supabaseAdmin
    .from("allocations")
    .update({
      position_value: allocationPositionValue.toNumber(),
      updated_tx: signature,
    })
    .eq("pk", allocationPk.toBase58());

  if (insertError) {
    throw new Error(`Error updating allocation: ${insertError.message}`);
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
        const voltrClient = new VoltrClient(connection);

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

        const allocations = await fetchAllocationsByAccountKeys(accountsKeys);

        // Update histories for each allocation
        await Promise.all(
          allocations.map((allocation) =>
            updateAllocationHistory(
              voltrClient,
              new PublicKey(allocation.pk),
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
