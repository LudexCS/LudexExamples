import * as ludex from "ludex";
import { ethers } from "ethers";

const chainConfig: ludex.configs.ChainConfig = {
  chainId: `0x${(31337).toString(16)}`,
  chainName: "Hardhat",
  rpcUrls: ["http://localhost:8545"],
  nativeCurrency: {
    name: "ETH",
    symbol: "ETH",
    decimals: 18
  }
};

let contractsMap: Record<string, {address: string; abi: any}>;
let ludexConfig: ludex.configs.LudexConfig;

window.onload = async () => {
  const res = await fetch("http://localhost:3000/contracts");
  contractsMap = await res.json();

  ludexConfig = {
    storeAddress: contractsMap["Store"].address,
    priceTableAddress: contractsMap["PriceTable"].address,
    ledgerAddress: contractsMap["Ledger"].address,
    sellerRegistryAddress: contractsMap["SellerRegistry"].address,
    itemRegistryAddress: contractsMap["ItemRegistry"].address
  };
};

document.getElementById("ownAddress")?.addEventListener("click", async () => {
  const connection = await ludex.BrowserWalletConnection.create(chainConfig);

  const address = await connection.getCurrentAddress();

  console.log("address: " + address.stringValue);

  (document.getElementById("address") as HTMLInputElement)!.value = 
    address.stringValue;
});

document.getElementById("prove")?.addEventListener("click", async () => {
  const tokenID = (document.getElementById("tokenID") as HTMLInputElement)?.value;

  if (!tokenID)
  {
    alert("No token ID");
    return;
  }

  const tokenIDNumber = BigInt("0x" + tokenID);

  const address = 
    (document.getElementById("address") as HTMLInputElement)?.value;

  if(!address)
  {
    alert("No address");
    return;
  }

  const provider = new ethers.JsonRpcProvider("http://localhost:8545");

  const ledger =
    ludex.facade.createWeb2UserFacade(chainConfig, ludexConfig, provider)
    .readonlyAccessLedger();

  const isOwner = await 
    ledger.proveOwnership(
      ludex.Address.create(address),
      tokenIDNumber);

  if (isOwner)
  {
    const purchaseLog = await ledger.getPurchaseInfo(tokenIDNumber);

    document.getElementById("purchaseLog")!.innerText =
      JSON.stringify({
        tokenID: purchaseLog.tokenID.toString(16),
        itemID: purchaseLog.itemID.toString(),
        buyer: purchaseLog.buyer.stringValue,
        timestamp: purchaseLog.timestamp
      }, null, '\t');
  } 
  else 
  {
    document.getElementById("purchaseLog")!.innerText = 
      "Not the owner of this item";
  }
});
