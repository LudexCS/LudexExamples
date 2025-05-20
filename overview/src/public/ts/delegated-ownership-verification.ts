import * as ludex from "ludex";
import { ethers } from "ethers";
import { chainAndLudexConfig } from "./configurations";

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

    const purchaseProxy = 
        ludex
        .facade
        .createWeb2UserFacade(chainConfig, ludexConfig)
        .readonlyAccessPurchaseProxy();

    const purchaseLog = 
        await purchaseProxy.getPurchaseInfo(tokenIDNumber);

    const buyer = (function () {
        if (typeof(purchaseLog.buyer) === "bigint")
        {
            return (
                (purchaseLog.buyer as bigint)
                .toString());
        } 
        else 
        {
            return (
                (purchaseLog.buyer as ludex.Address)
                .stringValue);
        }
    })();

    document.getElementById("purchaseLog")!.innerText =
        JSON.stringify({
            tokenID: purchaseLog.tokenID.toString(16),
            itemID: purchaseLog.itemID.toString(),
            buyer: buyer,
            timestamp: purchaseLog.timestamp
        }, null, '\t');
});