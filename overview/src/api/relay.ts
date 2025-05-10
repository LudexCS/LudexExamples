import * as ludex from "ludex";
import { ethers } from "ethers";
import { Express, Request, Response } from "express";
import { APIAttachment } from "./api-attachment";

export function postAPIRelay ()
{return function (attachment: APIAttachment) {
    const relayMaster = 
        ludex.relay.createLudexRelayMaster(
            attachment.ludexConfig,
            attachment.signer);

    attachment.app.post("/api/relay", async (req: Request, res: Response) => {
        const relayRequest = ludex.relay.deserializeRelayRequest(req.body);

        console.log("getting relay request");

        await relayMaster.acceptRequest(
            relayRequest,
            (args) => {
                console.log(`args: ${JSON.stringify(args)}`);
                res.json({ args });
            },
            (error) => {
                console.log(`error: ${error.message}`);
                res.status(500).json({ error: error.message });
            });
    });
};}