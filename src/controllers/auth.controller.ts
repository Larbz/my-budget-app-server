import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import User, { IUser } from "../models/User";
export const signup = async (req: Request, res: Response) => {
    //Creating the User
    // const user: IUser = new User(req.body);
    const user: IUser = new User({
        username: req.body.username,
        name: req.body.name,
        last_name: req.body.last_name,
        dni: req.body.dni,
        email: req.body.email,
        password: req.body.password,
    });
    user.password = await user.encryptPassword(user.password);
    //Saving the User
    const savedUser = await user.save();

    //Creating user token
    const token: string = jwt.sign({ _id: savedUser._id }, process.env.SECRET_KEY as string);

    res.header("auth-token", token).json(savedUser);
};
export const signin = async (req: Request, res: Response) => {
    const user = await User.findOne({ email: req.body.email });
    if (!user) res.status(400).json("Email or Password is Wrong");
    else {
        const correctPassword: boolean = await user.validatePassword(req.body.password);
        if (!correctPassword) return res.status(400).json("Invalid Password");
    }
    const token: string = jwt.sign({ _id: user?._id }, process.env.SECRET_KEY as string, {
        expiresIn: 60 * 60 * 24,
    });
    res.header("auth-token", token).json(user);
};
export const profile = async (req: Request, res: Response) => {
    const user = await User.findById(req.userId,{password:0,_id:0,__v:0}); //poniendo :0 se omite en la respuesta
    if(!user)return res.status(404).json("No user found")
    res.json({
        user
    });
};
