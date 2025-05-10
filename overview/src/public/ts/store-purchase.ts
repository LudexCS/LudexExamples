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
    const [chainConfig, ludexConfig] = await chainAndLudexConfig();
    const connection = await ludex.BrowserWalletConnection.create(chainConfig);
    
    const signer = await connection.getSigner();

    const facade = 
        ludex.facade.createWeb3UserFacade(
        chainConfig, 
        ludexConfig, 
        signer);

    const store = facade.metaTXAccessStore();

    const token = (function () {
        const tokenString = 
        document.getElementById("token")?.innerText;
        if (!tokenString)
        {
        return undefined;
        }

        return ludex.Address.create(tokenString);
    })();

    if (!token)
    {
        alert("No token");
        return;
    }

    const relayRequest = 
        await store.purchaseItemRequest(
        getItemID(),
        token,
        30000000n);

    const relayResponse = await
        fetch("/api/relay", {
        method: "POST",
        headers: { "Content-Type": "application/json"},
        body: ludex.relay.serializeRelayRequest(relayRequest)
        });

    const { args, error } = await relayResponse.json();

    if (error)
    {
        console.error(`message: ${error.message}`);
        return;
    }

    const purchaseID = relayRequest.onResponse(args);

  document.getElementById("purchaseID")!.innerText = purchaseID.toString(16);
});
