import * as ludex from "ludex";

type ContractInfo = {
  address: string;
  abi: any; // JSON ABI (정확히는 `Abi` 타입이나 일반적으로 any 사용)
};

type ContractsMap = Record<string, ContractInfo>;

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

let ludexConfig: ludex.configs.LudexConfig;
let priceTable: ludex.Access.Admin.IPriceTable;
let contractsMap: ContractsMap;

window.onload = async () => {
  const res = await fetch("http://localhost:3000/contracts");
  contractsMap = await res.json();

  const config: ludex.configs.LudexConfig = {
    storeAddress: contractsMap["Store"].address,
    priceTableAddress: contractsMap["PriceTable"].address,
    ledgerAddress: contractsMap["Ledger"].address,
    sellerRegistryAddress: contractsMap["SellerRegistry"].address,
    itemRegistryAddress: contractsMap["ItemRegistry"].address
  }

  document.getElementById("tokenAddress")!.textContent = (
    contractsMap["MockUSDC"].address);

  console.log("ludex config");
  ludexConfig = config;
};

async function getPriceTable(): Promise<ludex.Access.Admin.IPriceTable>
{
  const connection = await ludex.BrowserWalletConnection.create(chainConfig);

  const facade = 
    ludex
    .facade
    .createAdminFacade(chainConfig, ludexConfig, await connection.getSigner())

  const priceTable = facade.adminAccessPriceTable();

  return priceTable;
}

// Add Payment Channel
document.getElementById("add")?.addEventListener("click", async () => {
  const priceTable = await getPriceTable();

  const tokenAddress = 
    (document.getElementById("addPaymentChannel") as HTMLInputElement)?.value;

  if (!tokenAddress)
  {
    alert("No token address");
    return;
  }

  console.log(`tokenAddress: ${tokenAddress}`);

  let usdToToken = 
    BigInt(
      (document.getElementById("addInputRate") as HTMLInputElement)
      ?.value || "0");

  if (usdToToken <= 0n)  
  {
    alert("Cannot add token which has no value");
    return;
  }

  const decimals =
    BigInt(
      (document.getElementById("addInputDecimals") as HTMLInputElement)
      ?.value || "0");

  if (decimals < 4)
  {
    alert("Precision too low");
    return;
  }

  if (decimals > 32)
  {
    alert("Precision too big");
    return
  }

  await priceTable.addPaymentChannel(
    ludex.Address.create(tokenAddress), 
    usdToToken * (10n ** decimals)); 
});

// Remove Payment Channel
document.getElementById("remove")?.addEventListener("click", async () => {
  const priceTable = await getPriceTable();

  const tokenAddress = 
    (document.getElementById("removePaymentChannel") as HTMLInputElement)?.value;

  if (!tokenAddress)
  {
    alert("No token address");
    return;
  }

  console.log(`tokenAddress: ${tokenAddress}`);

  const isSucess = 
    await priceTable.removePaymentChannel(ludex.Address.create(tokenAddress));

  if (isSucess)
  {
    console.log("Successfully removed token: " + tokenAddress);
  }
  else
  {
    console.log("Could not remove token: " + tokenAddress);
  }
});

// Get Exchange Rate 
document.getElementById("get")?.addEventListener("click", async () => {
  const priceTable = await getPriceTable();

  const tokenAddress = 
    (document.getElementById("getExchangeRateOf") as HTMLInputElement)?.value;
  
  if (!tokenAddress)
  {
    alert("No token address");
    return;
  }

  console.log("tokenAddress: " + tokenAddress);

  const usdToToken = 
    await priceTable.getExchangeRateOf(ludex.Address.create(tokenAddress));

  document.getElementById("rate")!.innerText = usdToToken.toString();
});

document.getElementById("change")?.addEventListener("click", async() => {
  const priceTable = await getPriceTable();
  const tokenAddress =
   (document.getElementById("changeExchangeRate") as HTMLInputElement)?.value

  if (!tokenAddress)
  {
    alert("No token address");
    return;
  }

  let usdToToken = 
    BigInt(
      (document.getElementById("changeInputRate") as HTMLInputElement)
      ?.value || "0");

  const decimals =
    BigInt(
      (document.getElementById("changeInputDecimals") as HTMLInputElement)
      ?.value || "0");

  if (decimals < 4)
  {
    alert("Precision too low");
    return;
  }

  if (decimals > 32)
  {
    alert("Precision too big");
    return
  }

  const prevUSDToToken = 
    await priceTable.changeExchangeRate(
      ludex.Address.create(tokenAddress),
      usdToToken * 10n ** decimals);
  document.getElementById("prev")!.innerText = prevUSDToToken.toString();
});