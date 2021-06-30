"use strict";
import * as express from 'express'
const router: express.Router = express.Router();
import {check, sanitize, validationResult} from "express-validator";
import {container} from "tsyringe";
import {BatchRequestHandler,RequestItem} from "../util"

const batchRequestHandler = container.resolve(BatchRequestHandler);
import to from 'await-to-js';


import {NotAuthorized,checkIsUser,checkAuth} from "../middlewares"

import { Response, Request, NextFunction } from "express";


/**
 * @api {put} /api/v1/bulk-request Batch request
 * @apiName Batch request
 * @apiGroup Delivery
 *
 * @apiHeader {String} authorization Access token: Bearer sdssdsd....
 *
 * @apiParam {Array} requests Array of requests
 * @apiParam {String} requests.method Request method
 * @apiParam {String} requests.url Request url
 * @apiParam {String} requests.data Request data
 *
 * @apiSuccessExample Success-Response:
 * HTTP/1.1 200 OK
 {
   "status": "OK",
   "data": [
     {
       "status": "OK",
       "data": {
         "_id": "5dcd1d58363c741b7044de0f",
         "createdAt": "2019-11-14T09:24:40.343Z",
         "updatedAt": "2019-11-14T09:26:11.393Z",
         "driverShiftId": "5dcd1d31363c741b7044de0e",
         "vehicleCode": "VH15-0255",
         "driverCode": "EES2293",
         "id": "WBC00000039219",
         "city": "м. Київ",
         "address": "вул. Василя Касіяна, буд. 2/1, Автоклад",
         "custName": "АВТОКЛАД",
         "description": "Description",
         "contactName": "Автоклад Київ",
         "phone": "+38 (044) 502-2509",
         "docNo": "SHP0014100660",
         "__v": 0,
         "status": "completed",
         "recipientSignature": "a sadasd",
         "completeDate": "2019-11-14T09:26:11.388Z"
       }
     }
     ]
*/


router.post('/api/v1/bulk-request',checkAuth, async function (req: Request, res: Response, next: NextFunction) {
  const requests=req.body.requests;
  let [err,resp]=await to(batchRequestHandler.handle(requests,req));
  if(err){
      return res.status(500).json({error: "INTERNAL_SERVER_ERROR", errors: err});

  }
  return res.json({status: "OK", data:resp})
});




export {router};