import { Request, Response } from "express";
import Categorie, { ICategorie } from "../models/Categorie";

export const createCategorie = async (req: Request, res: Response) => {
    const categorie:ICategorie = new Categorie({
        name:req.body.name,
        icon:req.body.icon,
        color:req.body.color,
        presupuesto:req.body.presupuesto
    });
    console.log(categorie);
    const savedCategorie=await categorie.save();
    res.send(savedCategorie);
};

export const getCategories = async (req: Request, res: Response) => {
    const categories = await Categorie.find({});
    if (categories) {
        res.status(200).json(categories);
    }
    else{
        res.status(400).json("eeor")
    }
    console.log("asd")
};

export const getCategoriesById = async (req: Request, res: Response) => {
    const categories = await Categorie.findById({
        _id: req.params.id,
    });
    if (categories) {
        res.status(200).json(categories);
    }
};
