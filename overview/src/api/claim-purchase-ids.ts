import express, { Express, Request, Response } from "express";

import * as ludex from "ludex";
import { ethers } from "ethers";

import { APIAttachment } from "./api-attachment";


async function functionBody (attachment: APIAttachment, req: Request, res: Response) {
    const data = req.body;

    console.log(`data: ${JSON.stringify(data)}`);

    const ownerID = BigInt(data.ownerID);
    const ownerAddress = ludex.Address.create(data.ownerAddress);
    const purchaseIDs = 
        (data.purchaseIDs as string[]).map(entry => BigInt(entry));
    
    const purchaseProxy = 
        ludex
        .facade
        .createServiceFacade(
            attachment.privateChainConfig,
            attachment.ludexConfig,
            attachment.signer)
        .serviceAccessPurchaseProxy();

    const [resultOwnerAddress, resultPurchaseIDs] = 
        await purchaseProxy.claimPurchaseIDs(
            ownerID, 
            ownerAddress, 
            purchaseIDs);

    res.json({
        ownerAddress: ownerAddress.stringValue,
        purchaseIDs: purchaseIDs.map(entry => entry.toString())
    });
}

export function postAPIClaimPurchaseIDs()
{return (attachment: APIAttachment) => {
    attachment.app.post("/api/claim-purchase-ids", async (req: Request, res: Response) => {
        await functionBody(attachment, req, res);
    })
};}