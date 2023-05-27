import { CookieOptions, Response,Request } from "express";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import crypto from "crypto";

interface RefreshTokenResponse {
    token: string;
    expiresIn: number;
}

export const generateToken = (
    uid: mongoose.Types.ObjectId,
    res: Response
): RefreshTokenResponse | undefined => {
    const expiresIn = 60 * 15 * 1000;

    try {
        const token = jwt.sign({ _id: uid }, process.env.SECRET_KEY as string, {
            expiresIn,
        });
        res.cookie("jwt", token, {
            httpOnly: true,
            secure: false,
            maxAge: 1000 * 60 * 15,
            sameSite: "none",
        } as CookieOptions);
        return { token, expiresIn };
    } catch (error) {
        console.log(error);
    }
};

export const generateCSRF = (
    req:Request,
    res: Response
) => {
    //CREAMOS EL CSRF
    const csrf = crypto.randomUUID();
    req.csrf = csrf;
    res.cookie("csrf", csrf, {
        httpOnly: true,
        sameSite: "none",
        secure: false,
        maxAge: 15 * 60 * 1000,
    } as CookieOptions);
};

export const generateRefreshToken = (uid: mongoose.Types.ObjectId, res: Response) => {
    const expiresIn = 24 * 60 * 60 * 1000;
    try {
        const refreshToken = jwt.sign({ _id: uid }, process.env.REFRESH_KEY as string, {
            expiresIn,
        });

        res.cookie("refreshToken", refreshToken, {
            httpOnly: true,
            secure: false,
            maxAge: 24 * 60 * 60 * 1000,
            sameSite: "none",
        } as CookieOptions);
    } catch (error) {
        console.log(error);
    }
};
