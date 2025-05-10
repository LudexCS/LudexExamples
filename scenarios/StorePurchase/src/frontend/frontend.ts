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
    itemRegistryAddress: contractsMap["ItemRegistry"].address,
    forwarderAddress: contractsMap["ERC2771Forwarder"].address
  };

  document.getElementById("token")!.innerText = contractsMap["MockUSDC"].address;
};

function getItemID()
{
  return (
    BigInt((document.getElementById("itemID") as HTMLInputElement)?.value || '0'));
}

document.getElementById("getPriceInfoList")?.addEventListener("click", async () => {
  const connection = await ludex.BrowserWalletConnection.create(chainConfig);

  const facade =
    ludex.facade.createWeb2UserFacade(
      chainConfig, 
      ludexConfig,
      new ethers.JsonRpcProvider("http://localhost:8545"));
    
  const priceTable = facade.readonlyAccessPriceTable();

  const priceInfoListRaw = await priceTable.getPriceInfoList(getItemID());

  const priceInfoList = priceInfoListRaw.map(entry => ({
    token: entry.token.stringValue,
    tokenAmount: entry.tokenAmount.toString()
  }));

  document.getElementById("priceInfo")!.innerText = 
    JSON.stringify(priceInfoList, null, '\t');
})

document.getElementById("buy")?.addEventListener("click", async () => {
  const connection = await ludex.BrowserWalletConnection.create(chainConfig);
  
  const signer = await connection.getSigner();

  const facade = 
    ludex.facade.createWeb3UserFacade(
      chainConfig, 
      ludexConfig, 
      signer);

  const store = facade.metaTXAccessStore();

  const token = (function () {
    const tokenString = 
      document.getElementById("token")?.innerText;
    if (!tokenString)
    {
      return undefined;
    }

    return ludex.Address.create(tokenString);
  })();

  if (!token)
  {
    alert("No token");
    return;
  }

  const relayRequest = 
    await store.purchaseItemRequest(
      getItemID(),
      token,
      30000000n);

  const relayResponse = await
    fetch("http://localhost:4000/api/relay", {
      method: "POST",
      headers: { "Content-Type": "application/json"},
      body: ludex.relay.serializeRelayRequest(relayRequest)
    });

  const { args, error } = await relayResponse.json();

  if (error)
  {
    console.error(`message: ${error.message}`);
    return;
  }

  const purchaseID = relayRequest.onResponse(args);

  document.getElementById("purchaseID")!.innerText = purchaseID.toString(16);
});
