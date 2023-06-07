import { refreshToken } from './../controllers/auth.controller';
import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
interface IPayload {
    _id:string;
    iat:number;
    exp:number;
}

export const requireRefreshToken = (req:Request, res:Response, next:NextFunction) => {
    console.log("dentro")
    const cookies = req.cookies;
    console.log(cookies)
    if (!cookies.refreshToken || req.header('refreshToken')!=cookies.refreshToken) return res.status(401).json("Acceso Denegado");
    const refreshToken = cookies.refreshToken;
    const {_id} = jwt.verify(refreshToken, process.env.REFRESH_KEY as string) as IPayload;
    console.log(_id)
    req.userId=_id;
    next();
    // try {
    //     console.log(req.cookies)
    //     const refreshTokenCookie = req.cookies.refreshToken;
    //     console.log(refreshTokenCookie)
    //     if (!refreshTokenCookie) throw new Error("No existe el token");
    //     const { _id } = jwt.verify(refreshTokenCookie, process.env.REFRESH_KEY as string) as IPayload;
    //     req.userId = _id;
    //     next();
    // } catch (error) {
    //     console.log(error);
    //     res.status(401).json({ error });
    // }
};