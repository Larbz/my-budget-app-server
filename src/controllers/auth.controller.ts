import { Request, Response } from "express";
import session from "express-session";
import mongoose from "mongoose";
import {
    generateCSRF,
    generateRefreshToken,
    generateToken,
} from "../libs/tokenGenerators";
import User, { IUser } from "../models/User";

interface MySessionData {
    user?: { id: number; username: string };
}

declare module "express-session" {
    interface SessionData extends MySessionData {}
}

export const signup = async (req: Request, res: Response) => {
    //CREATING USER
    const user: IUser = new User({
        username: req.body.username,
        name: req.body.name,
        last_name: req.body.last_name,
        dni: req.body.dni,
        email: req.body.email,
        password: req.body.password,
    });
    //ENCRYPTING THE PASSWORD
    user.password = await user.encryptPassword(user.password);

    //TRY TO SAVE USER, AND MANAGE ERRORS
    try {
        const savedUser = await user.save();

        //CREATE CSRF
        generateCSRF(req, res);

        // CREATE REFRESH TOKEN
        generateRefreshToken(savedUser._id, req, res);

        //CREATE JWT TOKEN
        const tokenStructure = generateToken(savedUser._id, req, res);

        if (!tokenStructure) {
            return res.status(500).json("Internal server error");
        }
        return res.status(200).json({
            res: true,
            message: "Usuario creado correctamente",
            Authorization: tokenStructure.token,
            csrf: req.csrf,
            refreshToken: req.refreshToken,
        });
    } catch (error: unknown) {
        if (error instanceof Error) {
            if ((error as any).code === 11000) {
                return res
                    .status(400)
                    .json({ res: false, message: "Los datos ingresados no son validos" });
            } else {
                return res.status(400).json({ res: false, message: error.message });
            }
        } else {
            return res.status(500).json({ res: false, message: "Error desconocido" });
        }
    }
};

export const signin = async (req: Request, res: Response) => {
    //VERIFY IF USER EXIST
    const user = await User.findOne({ email: req.body.email });
    if (!user) res.status(400).json("Email is Wrong");
    else {
        //VALIDATE PASSWORD
        const correctPassword: boolean = await user.validatePassword(req.body.password);
        if (!correctPassword) return res.status(400).json("Invalid Password");
    }
    req.session.user = { id: 1, username: "2" };
    console.log(req.session);
    //CREATE CSRF
    generateCSRF(req, res);
    // CREATE REFRESH TOKEN
    generateRefreshToken(user?._id, req, res);

    //CREATE JWT TOKEN
    const tokenStructure = generateToken(user?._id, req, res);

    if (!tokenStructure) {
        return res.status(500).json("Internal server error");
    }
    res.status(200).json({
        name: user?.name,
        last_name: user?.last_name,
        csrf: req.csrf,
        Authorization: tokenStructure.token,
        refreshToken: req.refreshToken,
    });
};

export const logout = async (req: Request, res: Response) => {
    res.clearCookie("jwt", { httpOnly: true, sameSite: "none", secure: true });
    res.clearCookie("csrf", { httpOnly: true, sameSite: "none", secure: true });
    res.clearCookie("refreshToken", { httpOnly: true, sameSite: "none", secure: true });
    res.status(200).json({
        logged: "false",
    });
};

export const refreshToken = async (req: Request, res: Response) => {
    try {
        const tokenStructure = generateToken(
            new mongoose.Types.ObjectId(req.userId),
            req,
            res
        );
        generateCSRF(req, res);
        return res.status(200).json({
            jwt: tokenStructure?.token,
            expiresIn: tokenStructure?.expiresIn,
            csrf: req.csrf,
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ error: "error de server" });
    }
};

export const updateRefreshToken = async (req: Request, res: Response) => {
    try {
        const tokenStructure = generateToken(
            new mongoose.Types.ObjectId(req.userId),
            req,
            res
        );
        generateCSRF(req, res);
        generateRefreshToken(new mongoose.Types.ObjectId(req.userId), req, res);
        return res.status(200).json({
            jwt: tokenStructure?.token,
            csrf: req.csrf,
            refreshToken: req.refreshToken,
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ error: "error de server" });
    }
};

export const profile = async (req: Request, res: Response) => {
    const user = await User.findById(req.userId, {
        password: 0,
        _id: 0,
        __v: 0,
    }); //poniendo :0 se omite en la respuesta
    if (!user) return res.status(404).json("No user found");
    res.json({
        user,
    });
};
