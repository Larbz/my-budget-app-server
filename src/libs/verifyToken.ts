import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";

interface IPayload {
    _id:string;
    iat:number;
    exp:number;
}

export const TokenValidation = (req: Request, res: Response, next: NextFunction) => {
    const token = req.header("auth-token");
    if (!token) return res.status(401).json("Acceso Denegado");
    const {_id} = jwt.verify(token, process.env.SECRET_KEY as string) as IPayload;
    req.userId=_id;
    next();
};
