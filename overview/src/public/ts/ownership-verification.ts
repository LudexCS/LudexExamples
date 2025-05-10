import * as ludex from "ludex";
import { ethers } from "ethers";
import { chainAndLudexConfig } from "./configurations";

document.getElementById("ownAddress")?.addEventListener("click", async () => {
    const [chainConfig, ludexConfig] = await chainAndLudexConfig();

    const connection = await ludex.BrowserWalletConnection.create(chainConfig);

    const address = await connection.getCurrentAddress();

    console.log("address: " + address.stringValue);

    (document.getElementById("address") as HTMLInputElement)!.value = 
        address.stringValue;
});

document.getElementById("prove")?.addEventListener("click", async () => {
    const [chainConfig, ludexConfig] = await chainAndLudexConfig();
    const tokenID = 
        (document.getElementById("tokenID") as HTMLInputElement)?.value;

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

    const ledger =
        ludex.facade.createWeb2UserFacade(chainConfig, ludexConfig)
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