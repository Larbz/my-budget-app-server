import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";

interface IPayload {
    _id:string;
    iat:number;
    exp:number;
}

export const TokenValidation = (req: Request, res: Response, next: NextFunction) => {
    const cookies = req.cookies;
    console.log(cookies)
    if (!cookies.jwt|| (req.header("CSRF")!=cookies.csrf)) return res.status(401).json("Acceso Denegado");
    const token = cookies.jwt;
    const {_id} = jwt.verify(token, process.env.SECRET_KEY as string) as IPayload;
    req.userId=_id;
    req.csrf=cookies.csrf;
    next();
};
