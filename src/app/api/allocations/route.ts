import { createConnection } from "@/lib/privateConnection";
import { supabaseAdmin } from "@/lib/supabase";
import { validateAuthHeader } from "@/lib/validate";
import { PublicKey } from "@solana/web3.js";
import { VoltrClient } from "@voltr/vault-sdk";
import { NextResponse } from "next/server";

interface Transaction {
  transaction: {
    message: {
      accountKeys: string[];
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

        const allocations = await fetchAllocationsByAccountKeys(
          tx.transaction.message.accountKeys
        );

        // Initialize connection and client once per transaction
        const connection = createConnection();
        const voltrClient = new VoltrClient(connection);

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
