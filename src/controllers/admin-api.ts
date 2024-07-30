"use strict";
import { Response, Request, NextFunction } from "express";
import * as express from 'express'

const router: express.Router = express.Router()
import { checkAuth, checkIsAdmin, checkIsUser } from "../middlewares"
import {} from "../models";
import { endOfDay } from 'date-fns'
import { check, validationResult } from "express-validator";
import { container } from "tsyringe";
import { logger } from "../util/error.logger";
import to from "await-to-js";


router.get('/api/admin/v1/restart-vpn', async function (req: Request, res: Response, next: NextFunction) {

    const {exec} = require('child_process');
    exec('sudo service openvpn@client restart', (err: any, stdout: any, stderr: any) => {
        if (err) {
            // node couldn't execute the command
            logger.log(err);
            return res.end('VPN not restarted!')

        }

        // the *entire* stdout and stderr (buffered)
        logger.log(`stdout: ${stdout}`);
        logger.log(`stderr: ${stderr}`);
    });

    return res.end('VPN restarted!')
});

export { router }
