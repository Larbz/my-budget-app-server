import { Request, Response } from "express";
import Transaction, { ITransaction } from "../models/Transaction";
import Categorie from "../models/Categorie";

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
    const transactions = await Transaction.find({ userId: req.userId }, { __v: 0 })
        .populate({path:"categoryId",select:"name",model:Categorie})
        .where({ amount: { $gte: parseInt(req.query.min as string) || Number.MIN_VALUE, $lte: parseInt(req.query.max as string) || Number.MAX_VALUE } })
        .limit(req.body.limit);
    if (transactions) {
        res.status(200).json(transactions);
    }
};
