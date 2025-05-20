import * as ludex from "ludex";
import { ethers } from "ethers";
import { chainAndLudexConfig } from "./configurations";

document.getElementById("claim")?.addEventListener("click", async () => {
    const ownerID: bigint = (function (){
        const inputElement = document.getElementById("ownerID") as HTMLInputElement;
        return BigInt(inputElement.value);
    })();

    const purchaseIDs: bigint[] = (function () {
        const inputElement = document.getElementById("purchaseIDs") as HTMLInputElement;
        const rawString = inputElement.value || "";
        const rawIDStrings = rawString.replace(/(\s*)/g, "").split(";");
        rawIDStrings.forEach(console.log);
        return rawIDStrings.map(entry => BigInt("0x" + entry));
    })();

    const ownerAddress: ludex.Address = (function () {
        const inputElement = document.getElementById("ownerAddress") as HTMLInputElement;
        return ludex.Address.create(inputElement.value!);
    })();

    const response = await fetch("/api/claim-purchase-ids", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            ownerID: ownerID.toString(),
            ownerAddress: ownerAddress.stringValue,
            purchaseIDs: purchaseIDs.map(entry => entry.toString())
        })
    });

    if (!response.ok)
    {
        const msg = await response.text();
        console.log(`Failed: ${msg}`);
        return;
    }

    const resultData = await response.json();

    const resultAddress = resultData.ownerAddress;
    const resultPurchaseIDs = 
        resultData.purchaseIDs.map(entry => BigInt(entry));

    document.getElementById("claimResult")!.innerText = 
        JSON.stringify({
            ownerAddress: resultAddress,
            purchaseIDs: resultPurchaseIDs.map(entry => entry.toString(16))
        });
});