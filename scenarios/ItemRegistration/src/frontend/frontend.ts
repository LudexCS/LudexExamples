import * as ludex from "ludex";

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

function getSharers () : string[]
{
  let sharerString = 
    (document.getElementById("sharers") as HTMLInputElement)
    ?.value
    .replace(/\s/g, "");

  if (sharerString === "")
  {
    return [];
  }

  let entries = 
    sharerString
    .split(';')
  
    if (entries === undefined)
    {
      alert("No sharers");
      return [];
    }

  return entries;
}

function getShareTerms () : number[]
{
  let shareTermString = 
    (document.getElementById("shareTerms") as HTMLInputElement)
    ?.value
    .replace(/\s/g, "");

  if (shareTermString === "")
  {
    return [];
  }

  let entries =
    shareTermString
    .split(';')
    .map(stringEntry => Number(stringEntry));

  if (entries === undefined)
  {
    alert("No share terms");
    return [];
  }

  return entries;
}

document.getElementById("register")?.addEventListener("click", async () => {
  const itemName: string = 
    (document.getElementById("itemName") as HTMLInputElement)?.value;
  if (itemName === undefined)
  {
    alert("No name");
    return;
  }

  const itemPrice: string =
      (document.getElementById("itemPrice") as HTMLInputElement)?.value || "0";

  const wallet = await ludex.BrowserWalletConnection.create(chainConfig);
  const address = (await wallet.getCurrentAddress()).stringValue;

  const response = await fetch("/api/register", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      itemName: itemName,
      seller: address,
      sharers: getSharers(),
      itemPrice: itemPrice,
      shareTerms: getShareTerms()
    })
  });

  if (!response.ok)
  {
    const msg = await response.text();
    console.log(`Failed: ${msg}`);
  }

  const responseData = await response.json();

  const result = 
    [responseData.itemID, ...responseData.sharerIDs]
    .map(stringEntry => BigInt(stringEntry))
    .join("; ");
  
  document.getElementById("result")!.textContent = result.padStart(10, '0');
});
