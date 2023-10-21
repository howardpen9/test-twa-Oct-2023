// kQBEai2hVpPPK4FrULXeRbYtb05QOPtaoUsQvlvYGN49IOfV

import { useState } from "react";
import { useTonClient } from "./useTonClient";
import { useAsyncInitialize } from "./useAsyncInitialize";
import { useTonConnect } from "./useTonConnect";
import { Address, OpenedContract, fromNano } from "ton-core";
import { useQuery } from "@tanstack/react-query";
import { CHAIN } from "@tonconnect/protocol";
``;
import Counter from "../contracts/counter";
import { NftCollection } from "../../tact-contracts/output/sample_NftCollection";

export function useCollectionContract() {
  const { client } = useTonClient();
  const { sender, network } = useTonConnect();

  const counterContract = useAsyncInitialize(async () => {
    if (!client) return;
    const contract = NftCollection.fromAddress(
      Address.parse(
        network === CHAIN.MAINNET
          ? "EQBPEDbGdwaLv1DKntg9r6SjFIVplSaSJoJ-TVLe_2rqBOmH"
          : "EQCh-hSuHSqgtm0Ju6Oes5SsdTcNfcwHNy2reX6PmVEcikWf" // testnet address
      )
      // replace with your address from tutorial 2 step 8
    );
    return client.open(contract) as OpenedContract<NftCollection>;
  }, [client]);

  const { data, isFetching } = useQuery(
    ["Address"],
    async () => {
      if (!counterContract) return null;
      return await counterContract!.getGetCollectionData();
    },
    { refetchInterval: 3000 }
  );

  return {
    index: isFetching ? null : data?.next_item_index,
    value: isFetching ? null : data?.owner_address.toString(),
    address: counterContract?.address.toString(),
    send: () => {
      return counterContract?.send(sender, { value: 100000000n }, "Mint");
      //   return counterContract?.sendIncrement(sender);
      //   deployer.getSender(), { value: toNano(1) }, "Mint"
    },
  };
}
