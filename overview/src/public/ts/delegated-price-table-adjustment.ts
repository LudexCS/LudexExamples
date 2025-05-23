import * as ludex from "ludex";
import { ethers } from "ethers";
import { chainAndLudexConfig } from "./configurations";
import { usdPriceInContract } from "./usdPriceInContract";

function readAsBigint(id: string)
{
  return BigInt(
    (document.getElementById(id) as HTMLInputElement)?.value || '0');
}

function getItemID()
{
  return readAsBigint("itemID");
}

async function createPriceTable()
{
    const [chainConfig, ludexConfig] = await chainAndLudexConfig();

    const connection =
        await ludex.BrowserWalletConnection.create(chainConfig);

    const signer = await connection.getSigner();

    const priceTable =
        ludex.facade.createWeb3UserFacade(
        chainConfig, 
        ludexConfig, 
        signer)
        .metaTXAccessPriceTable();

    return priceTable;
}

document.getElementById("getPriceInfoList")?.addEventListener("click", async () => {
    const [chainConfig, ludexConfig] = await chainAndLudexConfig();
    console.log("getting price");
    const itemID = getItemID();

    const priceTable = (() => {
        const facade = 
        ludex.facade.createWeb2UserFacade(
            chainConfig, 
            ludexConfig);
        
        return facade.readonlyAccessPriceTable();
    })();

    const infoListRaw = await priceTable.getPriceInfoList(itemID)

    const infoList = 
        infoListRaw.map(info => (
        {token: info.token.stringValue, tokenAmount: info.tokenAmount.toString()}));
    
    document.getElementById("priceInfoList")!.textContent = JSON.stringify(infoList);
  });

  document.getElementById("getShare")?.addEventListener("click", async () => {
    const [chainConfig, ludexConfig] = await chainAndLudexConfig();

    console.log("getting share");
    const sharerID = readAsBigint("sharerID");
    const itemID = readAsBigint("sharedItemID");

    const priceTable = 
      ludex.facade.createWeb2UserFacade(chainConfig, ludexConfig)
      .readonlyAccessPriceTable();

    const share = await priceTable.getRevShare(sharerID, itemID);

    document.getElementById("share")!.textContent = share.toString();
  });

  document.getElementById("changePrice")?.addEventListener("click", async () => {
    const sellerID = readAsBigint("sellerID");
    const itemID = getItemID();

    const newPrice = 
        Number(
        (document.getElementById("newPrice") as HTMLInputElement)?.value || '0');
    
    const response = await fetch("/api/delegate-change-price", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            sellerID: sellerID.toString(),
            itemID: itemID.toString(),
            newPrice: usdPriceInContract(newPrice).toString()
        })
    });

    const resultData = await response.json();

    const prevPrice = resultData.prevPrice;
    document.getElementById("prevPrice")!.innerText = String(prevPrice);
});

document.getElementById("changeShare")?.addEventListener("click", async () => {
    const sellerID = readAsBigint("sellerID");
    const itemID = readAsBigint("sharerID");

    const newShare = 
        Number(
        (document.getElementById("newShare") as HTMLInputElement)?.value || '0');

    const response = await fetch("/api/delegate-change-share", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            sellerID: sellerID.toString(),
            itemID: itemID.toString(),
            newShare: newShare
        })
    });

    const resultData = await response.json(); 

    const prevShare = resultData.prevShare;
    document.getElementById("prevShare")!.innerText = String(prevShare);
});

document.getElementById("startDiscount")?.addEventListener("click", async () => {
    const sellerID = readAsBigint("sellerID");
    const itemID = getItemID();

    const discountPrice = 
        Number(
        (document.getElementById("discountPrice") as HTMLInputElement)?.value || '0');

    const endTime = (function() {
        const getInputValue = (id: string): string | undefined => {
            const element = document.getElementById(id) as HTMLInputElement | null;
            return element?.value;
        };

        const year = getInputValue("endYear") ?? "";
        const monthStr = getInputValue("endMonth") ?? "";
        const dayStr = getInputValue("endDay") ?? "";
        const hourStr = getInputValue("endHour") ?? "";
        const minStr = getInputValue("endMin") ?? "";

        if (!(year && monthStr && dayStr && hourStr && minStr)) {
            alert("Invalid date");
            return new Date(Date.now());
        }

        const month = parseInt(monthStr, 10);
        const day = parseInt(dayStr, 10);
        const hour = parseInt(hourStr, 10);
        const min = parseInt(minStr, 10);

        const paddedMonth = month.toString().padStart(2, '0');
        const paddedDay = day.toString().padStart(2, '0');
        const paddedHour = hour.toString().padStart(2, '0');
        const paddedMin = min.toString().padStart(2, '0');

        return new Date(
            `${year}-${paddedMonth}-${paddedDay}T${paddedHour}:${paddedMin}:00`);
    })();

    console.log(endTime);

    await fetch("/api/delegate-start-discount", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            sellerID: sellerID.toString(),
            itemID: itemID.toString(),
            discountPrice: usdPriceInContract(discountPrice).toString(),
            endTime: endTime       
        })
    });
});

document.getElementById("startReduction")?.addEventListener("click", async () => {
    const sellerID = readAsBigint("sellerID");
    const itemID = readAsBigint("sharerID");

    const reducedShare = 
        Number(
        (document.getElementById("reducedShare") as HTMLInputElement)?.value || '0');

    const endTime = (function() {
        const getInputValue = (id: string): string | undefined => {
        const element = document.getElementById(id) as HTMLInputElement | null;
        return element?.value;
        };

        const year = getInputValue("reductionEndYear") ?? "";
        const monthStr = getInputValue("reductionEndMonth") ?? "";
        const dayStr = getInputValue("reductionEndDay") ?? "";
        const hourStr = getInputValue("reductionEndHour") ?? "";
        const minStr = getInputValue("reductionEndMinute") ?? "";

        if (!(year && monthStr && dayStr && hourStr && minStr)) {
        alert("Invalid date");
        return new Date(Date.now());
        }

        const month = parseInt(monthStr, 10);
        const day = parseInt(dayStr, 10);
        const hour = parseInt(hourStr, 10);
        const min = parseInt(minStr, 10);

        const paddedMonth = month.toString().padStart(2, '0');
        const paddedDay = day.toString().padStart(2, '0');
        const paddedHour = hour.toString().padStart(2, '0');
        const paddedMin = min.toString().padStart(2, '0');

        return new Date(
        `${year}-${paddedMonth}-${paddedDay}T${paddedHour}:${paddedMin}:00`);
    })();

    console.log(endTime);

    await fetch("/api/delegate-start-reduction", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            sellerID: sellerID.toString(),
            itemID: itemID.toString(),
            reducedShare: reducedShare,
            endTime: endTime
        })
    });
});


