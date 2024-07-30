import { TokenServiceFactory } from '../util/auth/TokenServiceFactory.js'
import { Request, Response, NextFunction } from "express";

export function checkAuth(req: Request, res: Response, next: NextFunction) {
    let token: any = req.headers['x-access-token'] || req.headers.authorization || "";
    if (token.startsWith('Bearer ')) {
        token = token.slice(7, token.length).trimLeft();
    }
    let tokenService = TokenServiceFactory.getTokenService();
    let result = tokenService.verifyToken(token);

    if (result.error) {
        return NotAuthorized(req, res);
    }
    req.user = result;
    return next();
}

export function checkIsUser(req: Request, res: Response, next: NextFunction) {
    if (!req.user._id)
        return NotAuthorized(req, res);

    return next();
}

export function checkIsAdmin(req: Request, res: Response, next: NextFunction) {
    if (!req.user.isAdmin)
        return NotAuthorized(req, res);

    return next();
}

export function NotAuthorized(req: Request, res: Response, error?: any) {
    res.status(401).json({error: 'NOT_AUTHORIZED', desc: error ? error : ""})
}
