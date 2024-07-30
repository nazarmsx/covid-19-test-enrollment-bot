import * as jwt from "jsonwebtoken";

export default class TokenService {
    private secret: string;
    private expiresIn: string;

    constructor(secret: string = 'sdvxcv213esdxcxcSdsfdfSScxxz432sdZxvxAsxc2cvcZcdf34', expiresIn: string = '24h') {
        this.secret = secret;
        this.expiresIn = expiresIn;
    }

    public generateAccessToken(claims: any): string {
        return jwt.sign(claims, this.secret, {
            expiresIn: this.expiresIn
        })
    }

    public generateRefreshToken(claims: any): string {
        return jwt.sign(claims, this.secret, {
            expiresIn: '5y'
        })
    }

    public verifyToken(token: string): any {
        let decoded = null;
        if (!token) {
            return {error: 'NOT_AUTHORIZED'};
        }
        try {
            decoded = jwt.verify(token, this.secret)
        } catch (err) {
            return {error: 'NOT_AUTHORIZED', desc: err}
        }
        return decoded
    }

}