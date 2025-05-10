import * as ludex from "ludex";
import { ethers } from "ethers";
import { chainAndLudexConfig } from "./configurations";

document.getElementById("show")?.addEventListener("click", async () => {
    const [chainConfig, ludexConfig] = await chainAndLudexConfig();
    const itemID = 
        (document.getElementById("itemID") as HTMLInputElement)?.value;
    
    if (itemID === undefined)
    {
        alert("No item ID");
        return;
    }

    const facade = 
        ludex.facade.createWeb2UserFacade(
        chainConfig, 
        ludexConfig);

    const priceTable = facade.readonlyAccessPriceTable();

    const usdPrice = await
        priceTable.getPriceUsd(BigInt(itemID))
        .then(String);

    const priceInfoList = await (
        priceTable.getPriceInfoList(BigInt(itemID))
        .then(infoList => infoList.map(info => ({
            token: info.token.stringValue,
            tokenAmount: info.tokenAmount.toString()
        }))));
        
    console.log(priceInfoList.length);

    const displayString = 
        JSON.stringify({usdPrice: usdPrice, ...priceInfoList}, null, '\t');
    
    document.getElementById("result")!.textContent = displayString;
});