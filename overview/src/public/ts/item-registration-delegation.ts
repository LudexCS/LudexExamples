import * as ludex from "ludex";
import { chainAndLudexConfig } from "./configurations";

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

document.getElementById("register")?.addEventListener("click", async() => {
    const [chainConfig, ludexConfig] = await chainAndLudexConfig();

    const itemName: string = 
        (document.getElementById("itemName") as HTMLInputElement)?.value;

    if (itemName === undefined)
    {
        alert("No name");
        return;
    }

    const itemPrice: string =
        (document.getElementById("itemPrice") as HTMLInputElement)?.value || "0";

    const sellerID: bigint = (function () {
        const idString = 
            (document.getElementById("sellerID") as HTMLInputElement)?.value;

        // You MUST verify the ID ownership

        return BigInt(idString);
    })();

    const response = await fetch("/api/delegate-register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            itemName: itemName,
            seller: sellerID.toString(),
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