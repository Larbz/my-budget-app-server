import { Request, Response } from "express";
import {  Filters } from "models/Filters";
import mongoose from "mongoose";
import Categorie from "../models/Categorie";
import Transaction, { ITransaction } from "../models/Transaction";

export const createTransaction = async (req: Request, res: Response) => {
    const transaction: ITransaction = new Transaction({
        nameOfTransaction: req.body.nameOfTransaction,
        amount: req.body.amount,
        date: req.body.date,
        typeOfTransaction: req.body.typeOfTransaction,
        categoryId: req.body.categoryId,
        userId: req.userId,
    });
    transaction.date = transaction.convertDate(transaction.date);
    const savedTransaction = await transaction.save();
    res.send(savedTransaction);
};

export const getTransactions = async (req: Request, res: Response) => {
    Transaction.find({ userId: req.userId }, { __v: 0 })
        .populate({ path: "categoryId", select: "name", model: Categorie })
        .where({
            amount: {
                $gte: parseInt(req.query.min as string) || Number.MIN_VALUE,
                $lte: parseInt(req.query.max as string) || Number.MAX_VALUE,
            },
        })
        .limit(req.body.limit)
        .exec()
        .then((resultados) => {
            const transactionsFormatted = resultados.map((transaction) => {
                return {
                    nameOfTransaction: transaction.nameOfTransaction,
                    amount: transaction.amount,
                    typeOfTransaction: transaction.typeOfTransaction,
                    categoryId: transaction.categoryId,
                    userId: transaction.userId,
                    date: Intl.DateTimeFormat("en-GB").format(transaction.date),
                };
            });
            res.status(200).json(transactionsFormatted);
        })
        .catch((err) => res.status(401).json("Error"));
};

export const updateTransactions = async (req: Request, res: Response) => {
    const editables = {
        nameOfTransaction: req.body.nameOfTransaction,
        amount: req.body.amount,
        typeOfTransaction: req.body.typeOfTransaction,
        categoryId: req.body.categoryId,
    };
    const transaction = await Transaction.findByIdAndUpdate(req.params.id, editables);
    console.log(transaction);
    res.status(200).json(transaction);
};

export const getTransactionWithFilters = async (req: Request, res: Response) => {
    const day: number = req.body.day;
    const month: number = req.body.month;
    const year: number = req.body.year;
    const userId: string = req.userId;
    if (
        req.body.day > 31 ||
        req.body.day < 1 ||
        req.body.month < 1 ||
        req.body.month > 12 ||
        req.body.year < 1
    ) {
        //VALIDACION SIMPLE PARA FECHAS
        return res.status(400).json({
            res: false,
            message: "Datos invalidos",
        });
    } else if (req.body.day && req.body.month && !req.body.year) {
        //PONEMOS 2016 PARA PODER INCLUIR TAMBIEN CUANDO ES ANIO BISIESTO
        const compare = new Date(2016, month, 0);
        if (day > compare.getDate()) {
            return res.status(400).json({
                res: false,
                message: "Datos invalidos",
            });
        }
    } else if (req.body.day && req.body.month && req.body.year) {
        const compare = new Date(year, month, 0);
        if (day > compare.getDate()) {
            return res.status(400).json({
                res: false,
                message: "Datos invalidos",
            });
        }
    }
    
    const filters: Filters = {
        ...req.body,
        userId: new mongoose.Types.ObjectId(userId),
        ...(req.body.date &&
        {
            date:{
                ...(req.body.date["$gte"] && {"$gte":new Date(req.body.date["$gte"])}),
                ...(req.body.date["$lte"] && {"$lte":new Date(req.body.date["$lte"])}),
            },
        }),
        ...(req.body.categoryId && {categoryId:new mongoose.Types.ObjectId(req.body.categoryId)})
    };

    console.log(filters);
    const transactions = await Transaction.aggregate([
        {
            $project: {
                year: { $year: "$date" },
                month: { $month: "$date" },
                day: { $dayOfMonth: "$date" },
                nameOfTransaction: 1,
                amount: 1,
                categoryId: 1,
                userId: 1,
                typeOfTransaction: 1,
                date: 1,
            },
        },
        { $match: filters },
    ]);
    if (transactions.length !== 0) {
        return res.status(200).json({
            res: true,
            transactions,
        });
    } else {
        res.header("X-Message", "No se encontraron resultados con los filtros indicados");
        res.status(204);
        res.end();
    }
};
