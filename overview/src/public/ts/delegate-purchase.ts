import * as ludex from "ludex";
import { ethers } from "ethers";
import { chainAndLudexConfig } from "./configurations";

window.onload = async () => {
    const response = await fetch("/api/mock-usdc-address");
    const { usdcAddress } = await response.json();

    document.getElementById("token")!.innerText = usdcAddress;
}

function getItemID()
{
    return (
        BigInt(
            (document.getElementById("itemID") as HTMLInputElement)?.value 
            || '0'));
}

document.getElementById("getPriceInfoList")?.addEventListener("click", async () => {
    const [chainConfig, ludexConfig] = await chainAndLudexConfig();
    const connection = await ludex.BrowserWalletConnection.create(chainConfig);

    const facade =
        ludex.facade.createWeb2UserFacade(
        chainConfig, 
        ludexConfig);
        
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
    const token = (function () {
        const tokenString = 
        document.getElementById("token")?.innerText;
        if (!tokenString)
        {
            return undefined;
        }

        return ludex.Address.create(tokenString);
    })();

    const ownerID = (function () {
        const inputElement = document.getElementById("ownerID") as HTMLInputElement;
        return BigInt(inputElement.value);
    })();

    const response = await fetch ("/api/delegate-purchase", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            tokenAddress: token!.stringValue,
            itemID: getItemID().toString(),
            ownerID: ownerID.toString()
        })
    });
    
    if (!response.ok)
    {
        const msg = await response.text();
        console.log(`Failed: ${msg}`);
        return;
    }

    const resultData = await response.json();

    const resultPurchaseID = BigInt(resultData.purchaseID);

    document.getElementById("purchaseID")!.innerText = resultPurchaseID.toString(16);
});