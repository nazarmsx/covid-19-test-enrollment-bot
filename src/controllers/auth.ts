"use strict";
import * as express from 'express'
const router: express.Router = express.Router();
import {check, sanitize, validationResult} from "express-validator";
import {container} from "tsyringe";
import {ExternalApiMediator} from "../services/ExternalApiMediator"
const externalApi = container.resolve(ExternalApiMediator);
import to from 'await-to-js';
import {TokenServiceFactory} from '../util/auth/TokenServiceFactory'
const TokenService = TokenServiceFactory.getTokenService();
import {DriverShiftDocument, DriverShift} from "../models/DriverShift";

import { Response, Request, NextFunction } from "express";



/**
 * @api {post} /api/v1/login Login
 * @apiName Login
 * @apiGroup User
 *
 * @apiParam {String} [driverCode] Driver code
 * @apiParam {String} [vehicleCode] Vehicle code
 *
 * @apiSuccess {String} status Response status.
 * @apiSuccess {String} access_token  Access token.
 *
 * @apiSuccessExample Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *       "status": "OK",
 *       "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI1ZGNhYTM0NTJkNWRmOTE3MzQ3Mzk2ZGEiLCJkcml2ZXJDb2RlIjoiRUVTMjI5MyIsInZlaGljbGVDb2RlIjoiVkgxNS0wMjU1IiwiaWF0IjoxNTczNTYxMTU3LCJleHAiOjE1NzM2NDc1NTd9.ILqx3cCuP63nrpwzyw2Xzxp6PyICWdzfGPl_oIWdzDU"
 *     }
 *
 */

router.post('/api/v1/login', async function (req: Request, res: Response, next: NextFunction) {

  if(req.body.driverCode && req.body.vehicleCode){
    let driverShift = new DriverShift({
      driverCode: req.body.driverCode,
      vehicleCode: req.body.vehicleCode,
      createdAt: new Date(),
      updatedAt: new Date()
    });
    let [[err,driverData],[err2,carData]]=await Promise.all([
      to(externalApi.getDriverByCode(req.body.driverCode)),
      to(externalApi.getVehicleByCode(req.body.vehicleCode))
    ]);
    if(err || err2){
      return res.status(503).json({error:"EXTERNAL_API_ERROR",desc:err})
    }

    if(!carData || !driverData){
      return res.status(404).json({error:"DRIVER_NOT_FOUND",desc:err})
    }

    if(driverData && driverData.name){
      driverShift.driverName=driverData.name;
    }
    if(driverData && driverData.surname){
      driverShift.driverSurname=driverData.surname;
    }
    if(carData){
      driverShift.car=carData;
    }

    driverShift=await driverShift.save();
    let claims={_id:driverShift.id,driverCode:req.body.driverCode,vehicleCode:req.body.vehicleCode};
    let [access_token] = [TokenService.generateAccessToken(claims)];
    return res.json({status: "OK",access_token:access_token})
  }

  let claims={anonymous_user:true};
  let [access_token] = [TokenService.generateAccessToken(claims)];

  return res.json({status: "OK",access_token:access_token})
});

export {router};