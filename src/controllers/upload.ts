"use strict";
import * as express from 'express'
import { Response, Request, NextFunction } from "express";
const uploadRouter: express.Router = express.Router();
const multer  = require('multer');
const fileUpload = require('express-fileupload');
const crypto = require('crypto')
import {FILE_BASE_PATH} from "../util/secrets";

function extractFileExtension(fileName:string){
  return (/[.]/.exec(fileName)) ? /[^.]+$/.exec(fileName) : '';

}
const storage = multer.diskStorage({
  destination: function (req:Request, file:any, cb:Function) {
    cb(null, 'uploads/')
  },
  filename: function (req:Request, file:any, cb:Function) {

    let hash = crypto.createHash('md5').update(file.originalname+ '-'+ Date.now()).digest("hex");



    cb(null, `${hash}.${extractFileExtension(file.originalname)}`)
  }
});

const upload = multer({ storage: storage })

import {NotAuthorized,checkIsUser,checkAuth} from "../middlewares";


uploadRouter.post('/api/v1/upload',checkAuth, upload.array('photos', 20),async function (req: Request, res: Response, next: NextFunction) {
  if(!req.files || req.files.length===0){
    return res.status(400).json({error:"FILES_NOT_PROVIDED"})
  }

  let resp=req.files.map((e:{fieldname:string,originalname:string,encoding:string,filename:string,path:string})=>{
    return `${FILE_BASE_PATH}/${e.filename}`;
  });

  return res.json({status: "OK", data:resp})
});




export {uploadRouter};
