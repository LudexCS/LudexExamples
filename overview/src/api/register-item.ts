import * as ludex from "ludex";
import { ethers } from "ethers";
import { Express, Request, Response } from "express";
import { APIAttachment } from "./api-attachment";
import fnv1a from "fnv1a";

function post(attachment: APIAttachment)
{
    attachment.app.post("/api/register", async (req: Request, res: Response) => {
        const data = req.body;

        console.log(`data: ${JSON.stringify(data)}`);

        const itemName: string = data.itemName;
        const seller: ludex.Address = ludex.Address.create(data.seller);
        const sharers: bigint[] = 
            (data.sharers as string[]).map(entry => BigInt(entry))
        const itemPrice: bigint = BigInt(data.itemPrice);
        const shareTerms: number[] = 
            (data.shareTerms as string[]).map(entry => Number(entry));

        const itemRegistry = 
            ludex.facade.createServiceFacade(
                attachment.privateChainConfig,
                attachment.ludexConfig,
                attachment.signer)
            .serviceAccessItemRegistry();

        const nameHash = await itemRegistry.getNameHash(itemName);
        const shares: Array<[bigint, number]> = [];

        for (const [index, shareTerm] of shareTerms.entries())
        {
            const shareTermID = BigInt(
                fnv1a(
                    `${nameHash}@shareTerm@${index}@${shareTerm}`));
            
            shares.push([shareTermID, shareTerm]);
        }

        const [itemID, sharerIDs] = 
            await itemRegistry.registerItem(
                nameHash,
                seller,
                sharers,
                itemPrice,
                shares);
            
        res.json({
            itemID: itemID.toString(),
            sharerIDs: sharerIDs.map(entry => entry.toString())
        });
    });
}

export function postAPIRegisterItem () { return post; }