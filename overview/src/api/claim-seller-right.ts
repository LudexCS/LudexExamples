import express, { Express, Request, Response } from "express";

import * as ludex from "ludex";
import { ethers } from "ethers";

import { APIAttachment } from "./api-attachment";

async function functionBody (attachment: APIAttachment, req: Request, res: Response) {
    const data = req.body;

    console.log(`data: ${JSON.stringify(data)}`);

    const sellerID = BigInt(data.sellerID);
    const sellerAddress = ludex.Address.create(data.sellerAddress);
    const itemIDs =
        (data.itemIDs as string[]).map(entry => BigInt(entry));
    
    const sellerProxy = 
        ludex
        .facade
        .createServiceFacade(
            attachment.privateChainConfig,
            attachment.ludexConfig,
            attachment.signer)
        .serviceAccessSellerProxy();

    const [resultSellerAddress, resultItemIDs] =
        await sellerProxy.claimSellerRight(
            sellerID,
            itemIDs,
            sellerAddress);
    
    res.json({
        sellerAddress: resultSellerAddress.stringValue,
        itemIDs: resultItemIDs.map(entry => entry.toString())
    });
}

export function postAPIClaimSellerRight()
{return (attachment: APIAttachment) => {
    attachment.app.post("/api/claim-seller-right", async (req: Request, res: Response) => {
        await functionBody(attachment, req, res);
    })
};}