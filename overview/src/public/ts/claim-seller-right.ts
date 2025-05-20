import * as ludex from "ludex";
import { ethers } from "ethers";
import { chainAndLudexConfig } from "./configurations";

document.getElementById("claim")?.addEventListener("click", async () => {
    const sellerID: bigint = (function (){
        const inputElement = document.getElementById("sellerID") as HTMLInputElement;
        return BigInt(inputElement.value);
    })();

    const itemIDs: bigint[] = (function () {
        const inputElement = document.getElementById("itemIDs") as HTMLInputElement;
        const rawString = inputElement.value || "";
        const rawIDStrings = rawString.split(";");
        return rawIDStrings.map(entry => BigInt(entry));
    })();

    const sellerAddress: ludex.Address = (function () {
        const inputElement = document.getElementById("sellerAddress") as HTMLInputElement;
        return ludex.Address.create(inputElement.value!);
    })();

    const response = await fetch("/api/claim-seller-right", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            sellerID: sellerID.toString(),
            sellerAddress: sellerAddress.stringValue,
            itemIDs: itemIDs.map(entry => entry.toString())
        })
    });

    if (!response.ok)
    {
        const msg = await response.text();
        console.log(`Failed: ${msg}`);
        return;
    }

    const resultData = await response.json();

    const resultAddress = resultData.sellerAddress;
    const resultItemIDs = resultData.itemIDs;

    document.getElementById("claimResult")!.innerText = 
        JSON.stringify({
            sellerAddress: resultAddress,
            itemIDs: resultItemIDs
        });
})