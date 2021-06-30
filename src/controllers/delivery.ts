"use strict";
import * as express from 'express'
import {Response, Request, NextFunction} from "express";
const router: express.Router = express.Router();
import {check, sanitize, validationResult} from "express-validator";
import {container} from "tsyringe";
import {ExternalApiMediator,DeliveryService} from "../services"
import to from 'await-to-js';
import {NotAuthorized, checkIsUser, checkAuth} from "../middlewares"
import {logger} from "../util/error.logger";

const externalApi = container.resolve(ExternalApiMediator);
const deliveryService = container.resolve(DeliveryService);




/**
 * @api {get} /api/v1/driver/:code Get driver info by code
 * @apiName Get driver by code
 * @apiGroup Delivery
 *
 * @apiHeader {String} authorization Access token: Bearer sdssdsd....
 *
 * @apiParam {String} code Driver code
 *
 * @apiSuccess {String} status Response status.
 * @apiSuccess {Object} data Driver profile info.
 * @apiSuccess {String} data.name Driver name.
 * @apiSuccess {String} data.surname Driver surname.
 * @apiSuccessExample Success-Response:
 * HTTP/1.1 200 OK
 * {
 *   "status": "OK",
 *   "data": {
 *    "name": "Микола Миколайович",
 *    "surname": "Хижняк"
 *   }
 * }
 * @apiErrorExample {json} External API error:
 *     HTTP/1.1 503 Service Unavailable
 *     {
 *       "error": "EXTERNAL_API_ERROR"
 *     }
 * @apiErrorExample {json} Driver not found error:
 *     HTTP/1.1 404 Not Found
 *     {
 *       "error": "DRIVER_NOT_FOUND"
 *     }
 */


router.get('/api/v1/driver/:code',checkAuth, async function (req: Request, res: Response, next: NextFunction) {

    const driverCode=req.params.code;

    let [err,resp]=await to(externalApi.getDriverByCode(driverCode));

    if(err){
        return res.status(503).json({error:"EXTERNAL_API_ERROR",desc:err})
    }
    if(!resp){
        return res.status(404).json({error:"DRIVER_NOT_FOUND",desc:err})
    }

    deliveryService.addDriverToDatabase(driverCode,resp);

    return res.json({status: "OK", data: resp})
});

/**
 * @api {get} /api/v1/vehicle/:code Get vehicle info by code
 * @apiName Get vehicle by code
 * @apiGroup Delivery
 *
 * @apiHeader {String} authorization Access token: Bearer sdssdsd....
 *
 * @apiParam {String} code Vehicle code
 *
 * @apiSuccess {String} status Response status.
 * @apiSuccess {Object} data Car info.
 * @apiSuccess {String} data.mark Car manufacturer
 * @apiSuccess {String} data.model Car model.
 * @apiSuccess {String} data.color Car color.
 * @apiSuccess {String} data.licensePlate Car reg. number.

 * @apiSuccessExample Success-Response:
 * HTTP/1.1 200 OK
 * {
 *   "status": "OK",
 *   "data": {
 *     "mark": "RENAULT",
 *     "model": "DOKKER VAN",
 *     "color": null,
 *     "licencePlate": "АА8622ХА"
 *   }
 * }
 *
 * @apiErrorExample {json} External API error:
 *     HTTP/1.1 503 Service Unavailable
 *     {
 *       "error": "EXTERNAL_API_ERROR"
 *     }
 * @apiErrorExample {json} Driver not found error:
 *     HTTP/1.1 404 Not Found
 *     {
 *       "error": "VEHICLE_NOT_FOUND"
 *     }
 */

router.get('/api/v1/vehicle/:code',checkAuth, async function (req: Request, res: Response, next: NextFunction) {

  const vehicleCode=req.params.code;

  let [err,resp]=await to(externalApi.getVehicleByCode(vehicleCode));

  if(err){
    return res.status(503).json({error:"EXTERNAL_API_ERROR",desc:err})
  }
  if(!resp){
    return res.status(404).json({error:"VEHICLE_NOT_FOUND",desc:err})
  }

  return res.json({status: "OK", data: resp})
});

/**
 * @api {get} /api/v1/routing-sheet Get routing sheet
 * @apiName Get routing sheet
 * @apiGroup Delivery
 *
 * @apiHeader {String} authorization Access token: Bearer sdssdsd....
 *
 *
 * @apiSuccess {String} status Response status.
 * @apiSuccess {Object[]} data Array of routes.
 * @apiSuccess {String} data.id Route id
 * @apiSuccess {String} data.city City name.
 * @apiSuccess {String} data.address Route address.
 * @apiSuccess {String} data.custName Customer name.
 * @apiSuccess {String} data.description Description.
 * @apiSuccess {String} data.contactName Contact name.
 * @apiSuccess {String} data.phone Phone number.
 * @apiSuccess {Array} data.items Items.
 * @apiSuccessExample Success-Response:
 * HTTP/1.1 200 OK
 *  {
 *    "status": "OK",
 *    "data": [
 *      {
 *        "_id": "5dcd1d58363c741b7044de0f",
 *        "createdAt": "2019-11-14T09:24:40.343Z",
 *        "updatedAt": "2019-11-14T09:24:40.343Z",
 *        "driverShiftId": "5dcd1d31363c741b7044de0e",
 *        "vehicleCode": "VH15-0255",
 *        "driverCode": "EES2293",
 *        "id": "WBC00000039219",
 *        "city": "м. Київ",
 *        "address": "вул. Василя Касіяна, буд. 2/1, Автоклад",
 *        "custName": "АВТОКЛАД",
 *        "description": "Description",
 *        "contactName": "Автоклад Київ",
 *        "phone": "+38 (044) 502-2509",
 *        "docNo": "SHP0014100660",
 *        "__v": 0
 *      }
 *    ]
 *  }
 * @apiErrorExample {json} External API error:
 *     HTTP/1.1 503 Service Unavailable
 *     {
 *       "error": "EXTERNAL_API_ERROR"
 *     }
 * @apiErrorExample {json} Routing sheet not found error:
 *     HTTP/1.1 404 Not Found
 *     {
 *       "error": "NO_ROUTING_SHEET"
 *     }
 */

router.get('/api/v1/routing-sheet',checkAuth,checkIsUser, async function (req: Request, res: Response, next: NextFunction) {

  const driverCode=req.user.driverCode;
  const vehicleCode=req.user.vehicleCode;

  let [err,resp]=await to(externalApi.getRoutingSheet(driverCode,vehicleCode));

  if(err){
    return res.status(503).json({error:"EXTERNAL_API_ERROR",desc:err})
  }
  if(!resp){
    return res.status(404).json({error:"NO_ROUTING_SHEET",desc:err})
  }

  let driverShift=await deliveryService.findDeliveryShiftById(req.user._id);
  if (!driverShift) {
    return  NotAuthorized(req, res,"DRIVER_SHIFT_NOT_FOUND");
  }
  let result=await deliveryService.syncDeliveries(driverShift,resp);

  return res.json({status: "OK", data: result})
});

/**
 * @api {put} /api/v1/route Update route status
 * @apiName Update route status
 * @apiGroup Delivery
 *
 * @apiHeader {String} authorization Access token: Bearer sdssdsd....
 *
 * @apiParam {String} id Route id
 * @apiParam {String} status Route new status
 * @apiParam {String} lat Driver latitude
 * @apiParam {String} lon Driver longitude
 *
 * @apiSuccessExample Success-Response:
 * HTTP/1.1 200 OK
 *  {
 *    "status": "OK",
 *    "data":  {
 *        "_id": "5dcd1d58363c741b7044de0f",
 *        "createdAt": "2019-11-14T09:24:40.343Z",
 *        "updatedAt": "2019-11-14T09:24:40.343Z",
 *        "driverShiftId": "5dcd1d31363c741b7044de0e",
 *        "vehicleCode": "VH15-0255",
 *        "driverCode": "EES2293",
 *        "id": "WBC00000039219",
 *        "city": "м. Київ",
 *        "address": "вул. Василя Касіяна, буд. 2/1, Автоклад",
 *        "custName": "АВТОКЛАД",
 *        "description": "Description",
 *        "contactName": "Автоклад Київ",
 *        "phone": "+38 (044) 502-2509",
 *        "docNo": "SHP0014100660",
 *        "status":"ready"
 *        "__v": 0
 *      }
 *  }
 */

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
  const {status,lon,lat}=req.body;

  route=await deliveryService.updateRouteStatus(route,status,{lat,lon});

  return res.json({status: "OK", data: route})
}

router.put('/api/v1/route',checkAuth,checkIsUser,[
  check("id", "Route id is required").not().isEmpty(),
  check("status", "Route status is required").not().isEmpty(),
  check("lat", "lat is required").not().isEmpty(),
  check("lon", "lon is required").not().isEmpty(),
],updateRouteStatus);


/**
 * @api {put} /api/v1/route/complete Complete route
 * @apiName Complete route
 * @apiGroup Delivery
 *
 * @apiHeader {String} authorization Access token: Bearer sdssdsd....
 *
 * @apiParam {String} id Route id
 * @apiParam {String} contactPersonId Contact person id
 * @apiParam {String} signature Recipient signature
 * @apiParam {String} [note] Note
 * @apiParam {Array} [images] Array of image urls
 * @apiParam {String} lat Driver latitude
 * @apiParam {String} lon Driver longitude
 */

export async function completeRoute(req: Request, res: Response, next: NextFunction) {

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    logger.error(req.body, errors);
    return res.status(400).json({error: "BAD_PARAMETERS", errors: errors.array()});
  }

  let [err,route]=await to(deliveryService.findRouteById(req.body.id));


  if(err){
    return res.status(500).json({error:err.error})
  }
  if(!route){
    return res.status(400).json({error: "ROUTE_NOT_FOUND"});
  }
  const {contactPersonId,signature,note,lon,lat,images}=req.body;


  route=await deliveryService.completeRoute(route,{contactPersonId,signature,location:{lat,lon},note,images});

  return res.json({status: "OK", data: route})
}

router.put('/api/v1/route/complete',checkAuth,checkIsUser,[
  check("id", "Route id is required").not().isEmpty(),
  check("signature", "signature is required").not().isEmpty(),
  check("lat", "lat is required").not().isEmpty(),
  check("lon", "lon is required").not().isEmpty(),
]  ,completeRoute);


/**
 * @api {put} /api/v1/route/reject Reject route
 * @apiName Reject route
 * @apiGroup Delivery
 *
 * @apiHeader {String} authorization Access token: Bearer sdssdsd....
 *
 * @apiParam {String} id Route id
 * @apiParam {String} reason Reject reason
 * @apiParam {String} [note] Note
 * @apiParam {String} lat Driver latitude
 * @apiParam {String} lon Driver longitude
 */

export async function rejectRoute (req: Request, res: Response, next: NextFunction) {

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    logger.error(req.body, errors);
    return res.status(400).json({error: "BAD_PARAMETERS", errors: errors.array()});
  }

  let [err,route]=await to(deliveryService.findRouteById(req.body.id));

  if(err){
    return res.status(500).json({error:err.error})
  }
  if(!route){
    return res.status(400).json({error: "ROUTE_NOT_FOUND"});
  }
  const {reason,note,lon,lat}=req.body;

  route=await deliveryService.rejectRoute(route,{reason,note,location:{lat,lon}});

  return res.json({status: "OK", data: route})
}

router.put('/api/v1/route/reject',checkAuth,checkIsUser,[
  check("id", "Route id is required").not().isEmpty(),
  check("reason", "reason is required").not().isEmpty(),
  check("lat", "lat is required").not().isEmpty(),
  check("lon", "lon is required").not().isEmpty(),
],rejectRoute);

/**
 * @api {post} /api/v1/create-delivery-entry-header Open delivery
 * @apiName Open delivery
 * @apiGroup Delivery
 *
 * @apiHeader {String} authorization Access token: Bearer sdssdsd....
 *
 * @apiSuccessExample Success-Response:
 * HTTP/1.1 200 OK
 * {
 * "status": "OK",
 * "data": "1"
 * }
 */
router.post('/api/v1/create-delivery-entry-header', checkAuth, checkIsUser, async function (req: Request, res: Response, next: NextFunction) {

  const driverCode = req.user.driverCode;
  const vehicleCode = req.user.vehicleCode;
  let [err, resp] = await to(externalApi.createDeliveryEntryHeader(driverCode, vehicleCode ));
  if (err) {
    clearErrorObject(err);
    return res.status(503).json({error: "EXTERNAL_API_ERROR", desc: err})
  }
  if(resp==="1"){
    return res.json({status:"OK",data:resp})
  }else{
    return res.status(503).json({error:"UNKNOWN_RESPONSE",desc:resp});
  }
});

/**
 * @api {get} /api/v1/clear-test-data Clear test data
 * @apiName Clear test data
 * @apiGroup Delivery
 *
 * @apiHeader {String} authorization Access token: Bearer sdssdsd....
 */
router.get('/api/v1/clear-test-data', async function (req: Request, res: Response, next: NextFunction) {
  let [err, resp] = await to(Promise.all([externalApi.clearTestData(), deliveryService.clearDB()]));
  if (err) {
    return res.status(503).json({error: "EXTERNAL_API_ERROR", desc: err})
  }
  return res.json(resp[0]);
});


/**
 * @api {post} /api/v1/move-place Move place
 * @apiName Move place
 * @apiGroup Delivery
 *
 * @apiHeader {String} authorization Access token: Bearer sdssdsd....
 *
 * @apiParam {Number} movePlaceType Type 1,2,3
 * @apiParam {String} labelCode
 * @apiParam {String} [routingSheetCode]

 */


export async function movePlace(req: Request, res: Response, next: NextFunction) {

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({error: "BAD_PARAMETERS", errors: errors.array()});
  }
  const driverCode = req.user.driverCode;
  const vehicleCode = req.user.vehicleCode;
  const params: any = {
    driverCode,
    vehicleCode,
    labelCode: req.body.labelCode,
    movePlaceType: req.body.movePlaceType
  };
  if (req.body.routingSheetCode) {
    params.routingSheetCode = req.body.routingSheetCode;
  }

  let [err, resp] = await to(externalApi.movePlace(params));

  if (err) {
    clearErrorObject(err);
    return res.status(503).json({error: "EXTERNAL_API_ERROR", desc: err})
  }
  const labelScanHistory = {
    driverCode,
    vehicleCode,
    labelCode: req.body.labelCode,
    movePlaceType: req.body.movePlaceType,
    driverShiftId: req.user._id
  };
  deliveryService.addLabelScanToHistory(labelScanHistory)
  return res.json({status: "OK", data: resp})
}

router.post('/api/v1/move-place', checkAuth, checkIsUser, [
  check("movePlaceType", "movePlaceType is required").not().isEmpty(),
  check("labelCode", "labelCode is required").not().isEmpty(),
], movePlace);



/**
 * @api {post} /api/v1/close-delivery-entry-header Close delivery
 * @apiName Close delivery
 * @apiGroup Delivery
 *
 * @apiHeader {String} authorization Access token: Bearer sdssdsd....
 *
 * @apiSuccessExample Success-Response:
 * HTTP/1.1 200 OK
 * {
 * "status": "OK",
 * "data": "1"
 * }
 */
router.post('/api/v1/close-delivery-entry-header', checkAuth, checkIsUser, async function (req: Request, res: Response, next: NextFunction) {

  const driverCode = req.user.driverCode;
  const vehicleCode = req.user.vehicleCode;
  let [err, resp] = await to(externalApi.closeDeliveryEntryHeader(driverCode,vehicleCode));
  if (err) {
    clearErrorObject(err);
    return res.status(503).json({error: "EXTERNAL_API_ERROR", desc: err})
  }
  if(resp==="1"){
    return res.json({status:"OK",data:resp})
  }else{
    return res.status(503).json({error:"UNKNOWN_RESPONSE",desc:resp});
  }
});

/**
 * @api {post} /api/v1/check-loaded-places Check loaded places
 * @apiName Check loaded places
 * @apiGroup Delivery
 *
 * @apiHeader {String} authorization Access token: Bearer sdssdsd....
 * @apiSuccessExample Success-Response:
 * HTTP/1.1 200 OK
 {
  "status": "OK",
  "data": [
    {
      "generalDeliveryCode": "SHP0010544788",
      "laoadedPlaces": 1,
      "placesQuantity": 4
    }
  ]
}
 */
router.post('/api/v1/check-loaded-places', checkAuth, checkIsUser, async function (req: Request, res: Response, next: NextFunction) {

  const driverCode = req.user.driverCode;
  const vehicleCode = req.user.vehicleCode;
  let [err, resp] = await to(externalApi.checkLoadedPlaces({driverCode, vehicleCode}));
  if (err) {
    clearErrorObject(err);
    return res.status(503).json({error: "EXTERNAL_API_ERROR", desc: err})
  }
  if(resp && resp[0]){
    await deliveryService.addGeneralDeliveryCodeToLabelScan(req.user._id, resp[0].generalDeliveryCode)
  }
  return res.json({status: "OK", data: resp})
});

/**
 * @api {post} /api/v1/delivery/print Print routing sheet
 * @apiName Print routing sheet
 * @apiGroup Delivery
 *
 * @apiHeader {String} authorization Access token: Bearer sdssdsd....
 *
 * @apiSuccessExample Success-Response:
 * HTTP/1.1 200 OK
 * {
 * "status": "OK",
 * "data": "{}"
 * }
 */
router.post('/api/v1/delivery/print', checkAuth, checkIsUser, async function (req: Request, res: Response, next: NextFunction) {

  const driverCode = req.user.driverCode;
  const vehicleCode = req.user.vehicleCode;

  let [err, resp] = await to(externalApi.createWayBill(driverCode, vehicleCode ));
  if (err) {
    clearErrorObject(err);
    return res.status(503).json({error: "EXTERNAL_API_ERROR", desc: err})
  }
  return res.json({status:"OK",data:resp})
});

/**
 * @api {delete} /api/v1/delivery/label/:generalDeliveryCode Clear test label data
 * @apiName Clear label data
 * @apiGroup Delivery
 *
 * @apiHeader {String} authorization Access token: Bearer sdssdsd....
 *
 * @apiSuccessExample Success-Response:
 * HTTP/1.1 200 OK
 * {
 * "status": "OK",
 * "data": "{}"
 * }
 */
router.delete('/api/v1/delivery/label/:generalDeliveryCode', checkAuth, checkIsUser, async function (req: Request, res: Response, next: NextFunction) {
  const generalDeliveryCode = req.params.generalDeliveryCode;
  const labelCode = await deliveryService.findLabelByGeneralDeliveryCode(generalDeliveryCode);
  if(!generalDeliveryCode){
    return  res.status(400).json({error: "LABEL_NOT_FOUND"});
  }
  let [err, resp] = await to(externalApi.clearTestLabelData({labelCode} ));
  if (err) {
    clearErrorObject(err);
    return res.status(503).json({error: "EXTERNAL_API_ERROR", desc: err})
  }
  return res.json({status:"OK",data:resp})

});

/**
 * @api {post} /api/v1/close-routing-sheet Close routing sheet
 * @apiName Close Routing Sheet
 * @apiGroup Delivery
 *
 * @apiHeader {String} authorization Access token: Bearer sdssdsd....
 *
 * @apiParam {String} routingSheetCode Routing sheet code
 *
 * @apiSuccessExample Success-Response:
 * HTTP/1.1 200 OK
 * {
 * "status": "OK",
 * "data": "1"
 * }
 */
async function closeRoutingSheet(req: Request, res: Response, next: NextFunction) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({error: "BAD_PARAMETERS", errors: errors.array()});
  }
  const driverCode = req.user.driverCode;
  const vehicleCode = req.user.vehicleCode;
  let [err, resp] = await to(externalApi.closeRoutingSheet({driverCode, vehicleCode, routingSheetCode: req.body.routingSheetCode}));
  if (err) {
    clearErrorObject(err);
    return res.status(503).json({error: "EXTERNAL_API_ERROR", desc: err})
  }
  if (resp === "1") {
    return res.json({status: "OK", data: resp})
  } else {
    return res.status(503).json({error: "UNKNOWN_RESPONSE", desc: resp});
  }
}

router.post('/api/v1/close-routing-sheet', checkAuth, checkIsUser, [
  check("routingSheetCode", "routingSheetCode is required").not().isEmpty(),
], closeRoutingSheet);


/**
 * @api {post} /api/v1/clear-moved-places Clear Moved Places
 * @apiName Clear Moved Places
 * @apiGroup Delivery
 *
 * @apiHeader {String} authorization Access token: Bearer sdssdsd....
 *
 * @apiParam {String} routingSheetCode Routing sheet code
 *
 * @apiSuccessExample Success-Response:
 * HTTP/1.1 200 OK
 * {
 * "status": "OK",
 * "data": "1"
 * }
 */
async function clearMovedPlaces(req: Request, res: Response, next: NextFunction) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({error: "BAD_PARAMETERS", errors: errors.array()});
  }
  const driverCode = req.user.driverCode;
  const vehicleCode = req.user.vehicleCode;
  let [err, resp] = await to(externalApi.clearMovedPlaces({driverCode, vehicleCode, routingSheetCode: req.body.routingSheetCode}));
  if (err) {
    clearErrorObject(err);
    return res.status(503).json({error: "EXTERNAL_API_ERROR", desc: err})
  }
  if (resp === "2" || resp === "0") {
    return res.json({status: "OK", data: resp})
  } else {
    return res.status(503).json({error: "UNKNOWN_RESPONSE", desc: resp});
  }
}

router.post('/api/v1/clear-moved-places', checkAuth, checkIsUser, [
  check("routingSheetCode", "routingSheetCode is required").not().isEmpty(),
], clearMovedPlaces);


/**
 * @api {post} /api/v1/check-loaded-places Check Opened Way Bill
 * @apiName Check Opened Way Bill
 * @apiGroup Delivery
 *
 * @apiHeader {String} authorization Access token: Bearer sdssdsd....
 * @apiSuccessExample Success-Response:
 * HTTP/1.1 200 OK
 {
  "status": "OK",
  "data": true
}
 */
router.post('/api/v1/check-opened-way-bill', checkAuth, checkIsUser, async function (req: Request, res: Response, next: NextFunction) {

  const driverCode = req.user.driverCode;
  const vehicleCode = req.user.vehicleCode;
  let [err, resp] = await to(externalApi.checkOpenedWayBill({driverCode, vehicleCode}));
  if (err) {
    clearErrorObject(err);
    return res.status(503).json({error: "EXTERNAL_API_ERROR", desc: err})
  }
  return res.json({status: "OK", data: resp})
});

function clearErrorObject(err:any) {
  delete err.options;
  delete err.response;
}
export {router};