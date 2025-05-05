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

function getItemID()
{
  return BigInt(
    (document.getElementById("itemID") as HTMLInputElement)?.value || '0');
}

async function createPriceTable()
{
  const connection =
    await ludex.BrowserWalletConnection.create(chainConfig);

  const signer = await connection.getSigner();

  const priceTable =
    ludex.facade.createWeb3UserFacade(
      chainConfig, 
      ludexConfig, 
      signer, 
      ludex.Address.create(contractsMap["ERC2771Forwarder"].address))
    .metaTXAccessPriceTable();

  return priceTable;
}


document.getElementById("getPriceInfoList")?.addEventListener("click", async () => {
  console.log("getting price");
  const itemID = getItemID();

  const priceTable = (() => {
    const facade = 
      ludex.facade.createWeb2UserFacade(
        chainConfig, 
        ludexConfig,
        new ethers.JsonRpcProvider("http://localhost:8545"));
    
    return facade.readonlyAccessPriceTable();
  })();
  console.log("price table create");

  const infoListRaw = await priceTable.getPriceInfoList(itemID)
  console.log("info list raw");

  const infoList = 
    infoListRaw.map(info => (
      {token: info.token.stringValue, tokenAmount: info.tokenAmount.toString()}));
  
  document.getElementById("priceInfoList")!.textContent = JSON.stringify(infoList);
});

document.getElementById("changePrice")?.addEventListener("click", async () => {
  const itemID = getItemID();

  const newPrice = 
    BigInt(
      (document.getElementById("newPrice") as HTMLInputElement)?.value || '0');
  
  const priceTable = await createPriceTable();
     
  const relayRequest = 
    await priceTable.changeItemPriceRequest(itemID, newPrice, 3000000n);
  
  const relayResponse =
    await fetch("/api/relay", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: ludex.relay.serializeRelayRequest(relayRequest)
    });

  const { args, error } = await relayResponse.json();

  if (error)
  {
    console.error (error.message);
    return;
  }

  const prevPrice = relayRequest.onResponse(args);
  document.getElementById("prevPrice")!.innerText = String(prevPrice);
});

document.getElementById("startDiscount")?.addEventListener("click", async () => {
  const itemID = getItemID();

  const priceTable = await createPriceTable();

  const discountPrice = 
    BigInt(
      (document.getElementById("discountPrice") as HTMLInputElement)?.value || '0');

  const endTime = (function() {
    const getInputValue = (id: string): string | undefined => {
      const element = document.getElementById(id) as HTMLInputElement | null;
      return element?.value;
    };

    const year = getInputValue("endYear") ?? "";
    const monthStr = getInputValue("endMonth") ?? "";
    const dayStr = getInputValue("endDay") ?? "";
    const hourStr = getInputValue("endHour") ?? "";
    const minStr = getInputValue("endMin") ?? "";

    if (!(year && monthStr && dayStr && hourStr && minStr)) {
      alert("Invalid date");
      return new Date(Date.now());
    }

    const month = parseInt(monthStr, 10);
    const day = parseInt(dayStr, 10);
    const hour = parseInt(hourStr, 10);
    const min = parseInt(minStr, 10);

    const paddedMonth = month.toString().padStart(2, '0');
    const paddedDay = day.toString().padStart(2, '0');
    const paddedHour = hour.toString().padStart(2, '0');
    const paddedMin = min.toString().padStart(2, '0');

    return new Date(
      `${year}-${paddedMonth}-${paddedDay}T${paddedHour}:${paddedMin}:00`);
  })();

  console.log(endTime);

  const relayRequest = 
    await priceTable.startDiscountRequest(
      itemID, 
      discountPrice, 
      endTime, 
      3000000n);
    
  const relayResponse = 
    await fetch("http://localhost:4000/api/relay", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: ludex.relay.serializeRelayRequest(relayRequest)
    });

  const { args, error } = await relayResponse.json();

  if (error)
  {
    console.error(error.message);
    return;
  }
});