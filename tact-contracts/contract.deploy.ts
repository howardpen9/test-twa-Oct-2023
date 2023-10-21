// "deploy": "ts-node-esm ./tact-contracts/contract.deploy.ts"
// ================================================================= //
import { NftCollection } from "./output/sample_NftCollection";
// ================================================================= //
import {
  beginCell,
  contractAddress,
  toNano,
  TonClient4,
  WalletContractV4,
  internal,
  fromNano,
} from "ton";
import { mnemonicToPrivateKey } from "ton-crypto";
// import { printSeparator } from "./utils/print";
import * as dotenv from "dotenv";
dotenv.config();

(async () => {
  const OFFCHAIN_CONTENT_PREFIX = 0x01;
  const string_first =
    "https://s.getgems.io/nft-staging/c/628f6ab8077060a7a8d52d63/"; // Change to the content URL you prepared
  let content = beginCell()
    .storeInt(OFFCHAIN_CONTENT_PREFIX, 8)
    .storeStringRefTail(string_first)
    .endCell();

  //create client for testnet sandboxv4 API - alternative endpoint
  const client4 = new TonClient4({
    endpoint: "https://sandbox-v4.tonhubapi.com",
  });

  let mnemonics = (process.env.mnemonics_2 || "").toString(); // 🔴 Change to your own, by creating .env file!
  let keyPair = await mnemonicToPrivateKey(mnemonics.split(" "));
  let secretKey = keyPair.secretKey;
  let workchain = 0; //we are working in basechain.
  let deployer_wallet = WalletContractV4.create({
    workchain,
    publicKey: keyPair.publicKey,
  });
  console.log("DeployerAddress: " + deployer_wallet.address);

  let deployer_wallet_contract = client4.open(deployer_wallet);

  let init = await NftCollection.init(
    deployer_wallet_contract.address,
    content,
    {
      $$type: "RoyaltyParams",
      numerator: 350n, // 350n = 35%
      denominator: 1000n,
      destination: deployer_wallet_contract.address,
    }
  );
  let address = contractAddress(workchain, init);
  let deployAmount = toNano("0.15");
  let body = beginCell().storeUint(0, 32).storeStringTail("Mint").endCell();

  // send a message on new address contract to deploy it
  let seqno: number = await deployer_wallet_contract.getSeqno();

  console.log(
    "🛠️Preparing new outgoing massage from deployment wallet. \n" +
      deployer_wallet_contract.address
  );
  console.log("Seqno = ", seqno + "\n");
  printSeparator();

  // Get deployment wallet balance
  let balance: bigint = await deployer_wallet_contract.getBalance();
  console.log(
    "Current deployment wallet balance = ",
    fromNano(balance).toString(),
    "💎TON"
  );
  printSeparator();
  console.log("\n");

  await deployer_wallet_contract.sendTransfer({
    seqno,
    secretKey,
    messages: [
      internal({
        to: address,
        value: deployAmount,
        init: {
          code: init.code,
          data: init.data,
        },
        body: body,
      }),
    ],
  });
  console.log("====== Deployment message sent to =======\n==>", address);
})();

export function printSeparator() {
  console.log(
    "========================================================================================"
  );
}
