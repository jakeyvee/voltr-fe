import {
  Connection,
  PublicKey,
  AddressLookupTableAccount,
} from "@solana/web3.js";

export const getAddressLookupTableAccounts = async (
  keys: PublicKey[],
  connection: Connection
): Promise<AddressLookupTableAccount[]> => {
  const addressLookupTableAccountInfos =
    await connection.getMultipleAccountsInfo(keys);

  return addressLookupTableAccountInfos.reduce((acc, accountInfo, index) => {
    const addressLookupTableAddress = keys[index];
    if (accountInfo) {
      const addressLookupTableAccount = new AddressLookupTableAccount({
        key: new PublicKey(addressLookupTableAddress),
        state: AddressLookupTableAccount.deserialize(accountInfo.data),
      });
      acc.push(addressLookupTableAccount);
    }
    return acc;
  }, new Array<AddressLookupTableAccount>());
};

export const getWritableAccountKeys = async (
  keys: PublicKey[],
  writableIndexes: number[][],
  connection: Connection
) => {
  const addressLookupTableAccounts = await getAddressLookupTableAccounts(
    keys,
    connection
  );

  const writableAccountKeys = addressLookupTableAccounts.map((account, i) => {
    const addresses = account.state.addresses;
    const indexes = writableIndexes[i];

    return indexes.map((index) => addresses[index].toBase58());
  });

  return writableAccountKeys;
};
