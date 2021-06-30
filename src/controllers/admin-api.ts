"use strict";
import { Response, Request, NextFunction } from "express";
import * as express from 'express'
const router: express.Router = express.Router()
import {checkAuth, checkIsAdmin, checkIsUser} from "../middlewares"
import {Route, RouteDocument,Driver,RouteUpdateLog} from "../models";
import { endOfDay } from 'date-fns'
import {addRangeToQuery} from '../util'
import {check, validationResult} from "express-validator";
import {container} from "tsyringe";
import {DeliveryService} from "../services"
const deliveryService = container.resolve(DeliveryService);
import {logger} from "../util/error.logger";
import to from "await-to-js";
router.get('/api/admin/v1/routes',checkAuth,checkIsAdmin,
  async function getRoutes(req: Request, res: Response, next: NextFunction){

    let offset = req.query.offset ? parseInt(req.query.offset) : 0;
    let limit = req.query.limit ? parseInt(req.query.limit) : 10;

    let query:any={};

    if(req.query.carLicensePlate){
      query.carLicensePlate=req.query.carLicensePlate;
    }
    if(req.query.driverCode){
      query.driverCode=req.query.driverCode;
    }
    if(req.query.docNo){
        query.docNo=req.query.docNo;
    }
    if(req.query.status){
      query.status={$in:req.query.status.split(',')};
    }

    addRangeToQuery(req.query.createdAtTo,req.query.createdAtFrom,query,'createdAt');
    addRangeToQuery(req.query.updatedAtTo,req.query.updatedAtFrom,query,'updatedAt');


    if(req.query.count){
      let totalCount=await Route.countDocuments(query);
      return res.json({
        total: totalCount
      })
    }
    let sort:any={createdAt:-1};


    if(req.query.orderField && req.query.order){
      sort={[req.query.orderField]:req.query.order==='asc'?1:-1};
    }

    let routes = await   Route.find(query).sort(sort).limit(limit).skip(offset)

    res.json({
      data: routes
    })
});


router.get('/api/admin/v1/drivers',checkAuth,checkIsAdmin,
  async function getRoutes(req: Request, res: Response, next: NextFunction){

    let offset = req.query.offset ? parseInt(req.query.offset) : 0;
    let limit = req.query.limit ? parseInt(req.query.limit) : 10;

    let query:any={};

    if(req.query.count){
      let totalCount=await Driver.countDocuments(query);
      return res.json({
        total: totalCount
      })
    }

    let drivers = await   Driver.find(query,{driverCode:1,driverName:1,driverSurname:1}).limit(limit).skip(offset)

    res.json(drivers)
});

router.get('/api/admin/v1/route/:id',checkAuth,checkIsAdmin,async function (req: Request, res: Response, next: NextFunction) {
  let user = await Route.findOne({_id: req.params.id});
  if (!user) {
    return res.status(404).json({error: "ROUTE_NOT_FOUND"})
  }
  return res.json(user)
});

router.get('/api/admin/v1/route/status-history/:id',checkAuth,checkIsAdmin,async function (req: Request, res: Response, next: NextFunction) {
  let user = await RouteUpdateLog.find({routeId: req.params.id}).sort({createdAt:-1});
  if (!user) {
    return res.status(404).json({error: "ROUTE_NOT_FOUND"})
  }
  return res.json(user)
});

router.get('/api/admin/v1/restart-vpn',async function (req: Request, res: Response, next: NextFunction) {

  const { exec } = require('child_process');
  exec('sudo service openvpn@client restart', (err:any, stdout:any, stderr:any) => {
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

router.get('/api/delivery/error', checkAuth, async function (req: Request, res: Response, next: NextFunction) {
    return res.status(503).json({
        error: "EXTERNAL_API_ERROR", desc: {
            "name": "RequestError",
            "message": "Error: getaddrinfo ENOTFOUND delivery.eso.local",
        }
    })
});

export async function updateRouteStatus(req: Request, res: Response, next: NextFunction) {

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({error: "BAD_PARAMETERS", errors: errors.array()});
    }

    let [err,route]=await to(deliveryService.findRouteById(req.body.id));

    if(err){
        return res.status(500).json({error:err.error})
    }

    if(!route){
        return res.status(400).json({error: "ROUTE_NOT_FOUND"});
    }
    route=await deliveryService.updateRouteStatus(route,req.body.status,null);
    if (route.status === 'completed') {
        await deliveryService.unloadLabels(route);
    }

    return res.json({status: "OK", data: route})
}

router.put('/api/admin/v1/route',checkAuth,checkIsUser,[
    check("id", "Route id is required").not().isEmpty(),
    check("status", "Route status is required").not().isEmpty(),
],updateRouteStatus);


export {router}
