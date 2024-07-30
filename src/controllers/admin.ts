"use strict";
const bcrypt = require('bcrypt');
import { check, validationResult } from "express-validator";
import { container } from "tsyringe";

import { Response, Request, NextFunction } from "express";
import { TokenServiceFactory } from '../util/auth/TokenServiceFactory.js'

const TokenService = TokenServiceFactory.getTokenService();
import * as express from 'express'

const router: express.Router = express.Router()
import { Admin, AdminDocument } from "../models/Admin";
import { checkAuth, checkIsAdmin } from "../middlewares"
import { PasswordService } from "../services/PasswordService"

const passwordService = container.resolve(PasswordService);

router.post('/api/v1/admin/login',
    [
        check("login", "Login is required").not().isEmpty(),
        check("password", "Password is required").not().isEmpty()
    ],

    async function (req: Request, res: Response) {

        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(200).json({error: "BAD_CREDENTIALS", errors: errors.array()});
        }

        const login = req.body.login.toLowerCase().trim();

        let user = await Admin.findOne({login});
        if (!user) {
            return res.status(200).json({error: "USER_NOT_FOUND"})
        }
        let salt = user.salt;
        let hash = await bcrypt.hash(req.body.password, salt);

        if (user.password !== hash) {
            return res.status(200).json({error: "BAD_PASSWORD"})
        }
        let claims = {_id: user._id, isAdmin: true, login: user.login, claims: user.claims ? user.claims : {}};


        let [access_token, refresh_token] = [TokenService.generateAccessToken(claims), TokenService.generateRefreshToken(claims)];

        let response: any = {
            access_token: access_token,
            refresh_token: refresh_token,
        };
        user.lastActive = new Date();
        user.save();

        Object.assign(response, claims);

        return res.json(response)

    });

router.post('/api/v1/refresh-token', async function (req: Request, res: Response) {

    const token = req.body.refresh_token;

    if (!token) {
        return res.status(401).json({error: "REFRESH_TOKEN_NOT_PROVIDED"})
    }
    let tokenService = TokenServiceFactory.getTokenService();
    let decodedClaims = tokenService.verifyToken(token);

    if (decodedClaims.error) {
        return res.status(400).json({error: 'BAD_TOKEN'})
    }

    let user = await Admin.findOne({_id: decodedClaims._id});
    if (!user) {
        return res.status(200).json({error: "USER_NOT_FOUND"})
    }
    let claims = {_id: user._id, isAdmin: true, login: user.login, claims: user.claims ? user.claims : {}};
    let [access_token] = [TokenService.generateAccessToken(claims)];
    user.lastActive = new Date();
    user.save();
    res.json({
        status: 'OK',
        access_token: access_token,
    })
});

router.get('/api/v1/admins', checkAuth, checkIsAdmin,
    async function getAdmins(req: Request, res: Response, next: NextFunction) {

        let offset = req.query.offset ? parseInt(req.query.offset) : 0;
        let limit = req.query.limit ? parseInt(req.query.limit) : 10;

        let query: any = {};


        if (req.query.count) {
            let totalCount = await Admin.countDocuments(query);
            return res.json({
                total: totalCount
            })
        }

        let companies = await Admin.find(query, {password: 0, salt: 0}).sort({createdAt: -1}).limit(limit).skip(offset)

        res.json({
            data: companies
        })
    });


router.get('/api/v1/admin/:id', checkAuth, checkIsAdmin, async function (req: Request, res: Response, next: NextFunction) {
    let user = await Admin.findOne({_id: req.params.id});
    if (!user) {
        return res.status(404).json({error: "ADMIN_NOT_FOUND"})
    }
    return res.json(user)
});

router.post('/api/v1/admin',
    checkAuth, checkIsAdmin,
    [
        check("login", "login is not required").not().isEmpty(),
        check("password", "password is not required").not().isEmpty()
    ],
    async function (req: Request, res: Response, next: NextFunction) {

        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(422).json({errors: errors.array()});
        }
        const password = req.body.password;
        const login = req.body.login.toLowerCase().trim();
        let salt = await bcrypt.genSalt(10);
        let hash = await bcrypt.hash(password, salt);
        const user = new Admin({
            login: login,
            password: hash,
            salt: salt,
            claims: req.body.claims ? req.body.claims : {},
            createdAt: new Date(),
            updatedAt: new Date()
        });

        Admin.findOne({login: req.body.login}, (err, existingUser) => {
            if (err) {
                return next(err);
            }
            if (existingUser) {
                return res.status(409).json({error: "ADMIN_ALREADY_EXIST"})
            }

            user.save((err) => {
                if (err) {
                    return next(err);
                }
                const respData = user.toObject();
                delete user.password;
                delete user.salt;

                return res.json({status: "OK", data: respData})
            });
        });
    });

router.put('/api/v1/admin',
    checkAuth, checkIsAdmin,
    [
        check("_id", "_id is required").isLength({min: 1})
    ],

    async function (req: Request, res: Response, next: NextFunction) {

        const errors = validationResult(req);

        if (!errors.isEmpty()) {
            return res.status(422).json({error: "BAD_CREDENTIALS", errors: errors.array()});
        }
        const userId = req.body._id;
        let user = await Admin.findOne({_id: userId});
        if (!user) {
            return res.status(404).json({error: "USER_NOT_FOUND"})
        }

        user.updatedAt = new Date();

        if (req.body.login) {
            user.login = req.body.login;
        }
        if (req.body.password) {
            let salt = await bcrypt.genSalt(10);
            let hash = await bcrypt.hash(req.body.password, salt);
            user.password = hash;
            user.salt = salt;
        }
        if (req.body.claims) {
            user.claims = req.body.claims;
        }
        user = await user.save();

        delete user.password;

        return res.json({status: "OK", data: user})
    });

router.delete('/api/v1/admin/:id', checkAuth, checkIsAdmin, async function (req: Request, res: Response, next: NextFunction) {
    let result = await Admin.deleteOne({_id: req.params.id});
    return res.json(result)
});


export { router }
