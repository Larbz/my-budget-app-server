import crypto from "crypto";
import { CookieOptions, Request, Response } from "express";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import { config } from "../config/config";
import { refreshToken } from "./../controllers/auth.controller";
interface TokenResponse {
    token: string;
    expiresIn: number;
}

export const generateToken = (
    uid: mongoose.Types.ObjectId,
    req: Request,
    res: Response
): TokenResponse | undefined => {
    const expiresIn = 60 * 15 * 1000;
    try {
        const token = jwt.sign({ _id: uid }, config.SECRET_KEY as string, {
            expiresIn,
        });
        res.cookie("jwt", token, {
            httpOnly: true,
            secure: config.ENVIRONMENT === "local" ? true : false,
            // maxAge: 1000 * 60 * 15,
            maxAge: 24 * 60 * 60 * 1000,
            sameSite: config.ENVIRONMENT === "local" ? "none" : "strict",
        } as CookieOptions);
        return { token, expiresIn };
    } catch (error) {
        console.log(error);
    }
};

export const generateCSRF = (req: Request, res: Response) => {
    //CREAMOS EL CSRF
    const csrf = crypto.randomUUID();
    req.csrf = csrf;
    res.cookie("csrf", csrf, {
        httpOnly: true,
        sameSite: config.ENVIRONMENT === "local" ? "none" : "strict",
        secure: config.ENVIRONMENT === "local" ? true : false,
        maxAge: 24 * 60 * 60 * 1000,
    } as CookieOptions);
};

export const generateRefreshToken = (
    uid: mongoose.Types.ObjectId,
    req: Request,
    res: Response
) => {
    const expiresIn = 24 * 60 * 60 * 1000;
    try {
        const refreshToken = jwt.sign({ _id: uid }, config.REFRESH_KEY as string, {
            expiresIn,
        });
        req.refreshToken = refreshToken;
        res.cookie("refreshToken", refreshToken, {
            httpOnly: true,
            secure: config.ENVIRONMENT === "local" ? true : false,
            maxAge: 24 * 60 * 60 * 1000,
            sameSite: config.ENVIRONMENT === "local" ? "none" : "strict",
        } as CookieOptions);
    } catch (error) {
        console.log(error);
    }
};
