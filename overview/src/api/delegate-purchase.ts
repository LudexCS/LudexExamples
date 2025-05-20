import express, { Express, Request, Response } from "express";

import * as ludex from "ludex";
import { ethers } from "ethers";

import { APIAttachment } from "./api-attachment";

async function functionBody (attachment: APIAttachment, req: Request, res: Response) {
    const data = req.body;

    console.log(`data: ${JSON.stringify(data)}`);

    const token = ludex.Address.create(data.tokenAddress);
    const itemID = BigInt(data.itemID);
    const ownerID = BigInt(data.ownerID);

    const purchaseProxy = 
        ludex
        .facade
        .createServiceFacade(
            attachment.privateChainConfig,
            attachment.ludexConfig,
            attachment.signer)
        .serviceAccessPurchaseProxy();

    const purchaseID = 
        await purchaseProxy.purchaseItem(token, itemID, ownerID);

    res.json({ purchaseID: purchaseID.toString() });
}

export function postAPIDelegatePurchase()
{return (attachment: APIAttachment) => {
    attachment.app.post("/api/delegate-purchase", async (req: Request, res: Response) => {
        await functionBody(attachment, req, res);
    })
};}