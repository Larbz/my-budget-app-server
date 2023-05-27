import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
interface IPayload {
    _id:string;
    iat:number;
    exp:number;
}

export const requireRefreshToken = (req:Request, res:Response, next:NextFunction) => {
    try {
        const refreshTokenCookie = req.cookies.refreshToken;
        if (!refreshTokenCookie) throw new Error("No existe el token");
        const { _id } = jwt.verify(refreshTokenCookie, process.env.REFRESH_KEY as string) as IPayload;
        req.userId = _id;
        next();
    } catch (error) {
        console.log(error);
        res.status(401).json({ error });
    }
};