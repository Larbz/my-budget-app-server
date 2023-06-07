import { IsoDate } from "aws-sdk/clients/lightsail";
import { Request, Response } from "express";
import { Filters } from "models/Filters";
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

interface myOwnQuery {
    userId: mongoose.Types.ObjectId;
    beforeThan?: string;
    afterThan?: string;
    date?: {
        $gte?: Date;
        $lte?: Date;
    };
    lowerThan?: string;
    greaterThan?: string;
    amount?: {
        $gte?: number;
        $lte?: number;
    };
    categoryId?: mongoose.Types.ObjectId;
}
function parseQueryParams(query: myOwnQuery): myOwnQuery {
    const queryParams: myOwnQuery = {} as myOwnQuery;
    queryParams.userId = query.userId;
    if (query.beforeThan !== undefined || query.afterThan !== undefined) {
        queryParams.date = {
            ...(query.afterThan && { $gte: new Date(query.afterThan) }),
            ...(query.beforeThan && { $lte: new Date(query.beforeThan) }),
        };
    }
    if (query.lowerThan !== undefined || query.greaterThan !== undefined) {
        queryParams.amount = {
            ...(query.greaterThan && { $gte: parseInt(query.greaterThan) }),
            ...(query.lowerThan && { $lte: parseInt(query.lowerThan) }),
        };
    }

    if (query.categoryId !== undefined) {
        queryParams.categoryId = new mongoose.Types.ObjectId(query.categoryId);
    }

    return queryParams;
}
export const getTransactionWithFilters = async (req: Request, res: Response) => {
    const userId: string = req.userId;
    const limit: number = parseInt(req.query.limit as string) || 10;
    const page: number = parseInt(req.query.page as string) || 1;
    const skip: number = limit * (page - 1);
    const queryParams = parseQueryParams({
        ...req.query,
        userId: new mongoose.Types.ObjectId(userId),
    } as myOwnQuery);
    const transactions = await Transaction.aggregate([
        { $match: queryParams },
        {
            '$facet': {
              'data': [], 
              'count': [
                {
                  '$count': 'count'
                }
              ]
            }
          }, {
            '$unwind': {
              'path': '$count'
            }
          }, {
            '$unwind': {
              'path': '$data'
            }
          }, {
            '$skip': skip
          }, {
            '$limit': limit
          }, {
            '$lookup': {
              'from': 'categories', 
              'localField': 'data.categoryId', 
              'foreignField': '_id', 
              'as': 'data.category'
            }
          }, {
            '$unwind': {
              'path': '$data.category',
            //   preserveNullAndEmptyArrays:true
            }
          }, {
            '$project': {
              '_id': '$data._id', 
              'nameOfTransaction': '$data.nameOfTransaction', 
              'typeOfTransaction': '$data.typeOfTransaction', 
              'amount': '$data.amount', 
              'userId': '$data.userId', 
              'category': '$data.category', 
              'date': '$data.date', 
              'year': {
                '$year': '$data.date'
              }, 
              'month': {
                '$month': '$data.date'
              }, 
              'day': {
                '$dayOfMonth': '$data.date'
              }, 
              'count': '$count.count'
            }
          }, {
            '$project': {
              'category.__v': 0
            }
          }




        // { $skip: skip },
        // { $limit: limit },
        // {
        //     $lookup: {
        //         from: "categories",
        //         localField: "categoryId",
        //         foreignField: "_id",
        //         as: "category",
        //     },
        // },
        // {
        //     $unwind: {
        //         path: "$category",
        //     },
        // },
        // {
        //     $project: {
        //         _id: 1,
        //         nameOfTransaction: 1,
        //         typeOfTransaction: 1,
        //         userId: 1,
        //         amount: 1,
        //         date: 1,
        //         category: 1,
        //         year: {
        //             $year: "$date",
        //         },
        //         month: {
        //             $month: "$date",
        //         },
        //         day: {
        //             $dayOfMonth: "$date",
        //         },
        //     },
        // },
        // {
        //     $project: {
        //         "category.__v": 0,
        //     },
        // },
        // {
        //     $sort: {
        //         date: 1,
        //     },
        // },
    ]);
    if (transactions.length !== 0) {
        return res.status(200).json({
            res: true,
            count: transactions.length,
            totalResults:transactions[0].count,
            data: transactions,
        });
    } else {
        res.header("X-Message", "No se encontraron resultados con los filtros indicados");
        res.status(204);
        res.end();
    }
};

