import { IsoDate } from "aws-sdk/clients/lightsail";
import { Pipe } from "aws-sdk/clients/pipes";
import { Request, Response } from "express";
import { Filters } from "models/Filters";
import mongoose, { Aggregate, Mongoose, PipelineStage, Query, mongo } from "mongoose";
import { config } from "../config/config";
import Categorie from "../models/Categorie";
import Transaction, { ITransaction } from "../models/Transaction";
import { Document } from "mongoose";
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
    lowerThan?: string;
    date?: {
        $gte?: Date;
        $lt?: Date;
    };
    greaterThan?: string;
    nameOfTransaction?: {
        $regex?: RegExp;
    };
    name?: string;
    // $text?:{
    //     $search?:string;
    // },
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
        var fecha;
        if (query.beforeThan !== undefined) {
            fecha = new Date(query.beforeThan);
            fecha.setDate(fecha.getDate() + 1);
        }

        queryParams.date = {
            ...(query.afterThan && { $gte: new Date(query.afterThan) }),
            ...(query.beforeThan && { $lt: fecha }),
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
    // if (query.name !== undefined) {
    //     queryParams.nameOfTransaction = {
    //         ...(query.name && { $regex: RegExp(`\\b${query.name}.*\\b`, "gmi") }),
    //         // ...(query.name && { $regex: RegExp(`${query.name}`, "gmi") }),
    //     };

    // queryParams.$text={
    //     ...(query.name && { $search: query.name }),
    // }
    // }

    return queryParams;
}

export const getTransactionWithFilters = async (req: Request, res: Response) => {
    const userId: string = req.userId;
    const limit: number = parseInt(req.query.limit as string) || 10;
    const page: number = parseInt(req.query.page as string) || 1;
    const skip: number = limit * (page - 1);
    const name: string = req.query.name as string;
    const queryParams = parseQueryParams({
        ...req.query,
        userId: new mongoose.Types.ObjectId(userId),
    } as myOwnQuery);

    const filters = {
        ...{ $match: queryParams },
        // ...{ $sort: { date: 1 } },
        ...{ $skip: skip },
        ...{ $limit: limit },
        ...{
            $lookup: {
                from: "categories",
                localField: "categoryId",
                foreignField: "_id",
                as: "category",
            },
        },
        ...{
            $unwind: {
                path: "$category",
            },
        },
        ...{
            $project: {
                categoryId: 0,
                "category.__v": 0,
                "category._id": 0,
            },
        },
    };
    const filterToCount = {
        ...{ $match: queryParams },
    };
    const arr = Object.entries(filters).map(([value1, value2]) => {
        const objeto: { [clave: string]: any } = {};
        objeto[value1] = value2;
        return objeto;
    });

    const arrForCount = Object.entries(filterToCount).map(([value1, value2]) => {
        const objeto: { [clave: string]: any } = {};
        objeto[value1] = value2;
        return objeto;
    });

    if (name) {
        arrForCount.unshift({
            $search: {
                index: "autoComplete",
                autocomplete: {
                    query: name,
                    path: "nameOfTransaction",
                    tokenOrder: "sequential",
                },
            },
        });
        arr.unshift({
            $search: {
                index: "autoComplete",
                autocomplete: {
                    query: name,
                    path: "nameOfTransaction",
                    tokenOrder: "sequential",
                },
            },
        });
    }
    // console.log(arrForCount);
    // console.log(arr);
    // let count:
    //     | Aggregate<any[]>
    //     | Query<
    //           number,
    //           mongoose.Document<unknown, {}, ITransaction> &
    //               Omit<
    //                   ITransaction & {
    //                       _id: mongoose.Types.ObjectId;
    //                   },
    //                   never
    //               >
    //       >;
    // if (!req.query.name) {
    //     count = Transaction.aggregate(arrForCount as unknown as PipelineStage[]);
    // } else {
    //     count = Transaction.count(queryParams);
    // }

    // const count = Transaction.aggregate(arrForCount as unknown as PipelineStage[]);
    // let count: Aggregate<any[]>;
    // if (req.query.name) {
    //     count = Transaction.aggregate([
    // {
    //     $search: {
    //         index: "autoComplete",
    //         autocomplete: {
    //             query: req.query.name,
    //             path: "nameOfTransaction",
    //             tokenOrder: "sequential",
    //         },
    //     },
    // },
    // { $match: queryParams },
    //     ]);
    // } else {
    //     count = Transaction.aggregate([{ $match: queryParams }]);
    // }

    var count:
        | Aggregate<any[]>
        | Query<
              number,
              Document<unknown, {}, ITransaction> &
                  Omit<
                      ITransaction & {
                          _id: mongoose.Types.ObjectId;
                      },
                      never
                  >,
              {},
              ITransaction
          >;
    if (name) {
        count = Transaction.aggregate(arrForCount as unknown as PipelineStage[]);
    } else {
        count = Transaction.count(queryParams);
    }

    // const asd = await Transaction.count(queryParams)
    // console.log(asd)
    // const count = Transaction.aggregate(arrForCount as unknown as PipelineStage[])

    // console.log(queryParams);
    // const count = await Transaction.aggregate([
    //     {
    //         $match: queryParams,
    //     },
    // ]);
    // const count = await Transaction.aggregate([
    //     // {
    //     //   $search: {
    //     //     index: "autoComplete",
    //     //     autocomplete: {
    //     //       query: "atta",
    //     //       path: "nameOfTransaction",
    //     //       tokenOrder: "sequential",
    //     //     },
    //     //   },
    //     // }
    //     {
    //       $match:
    //         /**
    //          * query: The query in MQL.
    //          */
    //         {
    //           userId: new mongoose.Types.ObjectId("645071a3d13b2166978f07f6")
    //         },
    //     },
    //     // {
    //     //   $count:
    //     //     /**
    //     //      * Provide the field name for the count.
    //     //      */
    //     //     "count",
    //     // }
    //   ]);

    const transactions = Transaction.aggregate(arr as unknown as PipelineStage[]);

    //USANDO PROMISE ALL CON THEN Y CATCH

    // Promise.all([count,transactions]).then(([countResult,transactionsResult])=>{

    //   if (transactionsResult.length !== 0) {
    //       return res.status(200).json({
    //           res: true,
    //           count:countResult,
    //           // totalResults:transactionsResult[0].count,
    //           data: transactionsResult,
    //       });
    //   } else {
    //       res.header("X-Message", "No se encontraron resultados con los filtros indicados");
    //       res.status(204);
    //       res.end();
    //   }
    // }).catch((err:any)=>{
    //   console.error('Error al ejecutar las consultas:', err);
    // })

    //USANDO PROMISE ALL CON TRY Y CATCH
    try {
        const [countResult, transactionsResult] = await Promise.all([
            count,
            transactions,
        ]);
        if (transactionsResult.length !== 0) {
            var contador:number;
            if(typeof countResult == 'number'){
                contador = countResult
            }
            else{
                contador = countResult.length
            }
            const totalPages = Math.ceil(contador / limit);
            const currentPage = page;
            return res.status(200).json({
                res: true,
                totalResults:contador,
                currentPage,
                totalPages,
                count: transactionsResult.length,
                data: transactionsResult,
            });
        } else {
            res.header(
                "X-Message",
                "No se encontraron resultados con los filtros indicados"
            );
            res.status(204);
            res.end();
        }
    } catch (err) {
        console.error("Error al ejecutar las consultas:", err);
    }
};

export const getTransactionsByText = async (req: Request, res: Response) => {
    const userId: string = req.userId;
    const limit: number = parseInt(req.query.limit as string) || 10;
    const page: number = parseInt(req.query.page as string) || 1;
    const skip: number = limit * (page - 1);
    const name: string = req.query.name as string;
    const queryParams = parseQueryParams({
        ...req.query,
        userId: new mongoose.Types.ObjectId(userId),
    } as myOwnQuery);
    const count = Transaction.count({
        ...(name && { $text: { $search: name } }),
        ...queryParams,
    });

    const transactions = Transaction.aggregate([
        {
            $match: {
                ...(name && { $text: { $search: name } }),
                ...queryParams,
            },
        },
        {
            $sort: {
                date: 1,
            },
        },
        {
            $skip: skip,
        },
        {
            $limit: limit,
        },
        {
            $lookup: {
                from: "categories",
                localField: "categoryId",
                foreignField: "_id",
                as: "category",
            },
        },
        {
            $unwind: {
                path: "$category",
            },
        },
        {
            $project: {
                categoryId: 0,
                "category.__v": 0,
                "category._id": 0,
            },
        },
    ]);

    try {
        const [countResult, transactionsResult] = await Promise.all([
            count,
            transactions,
        ]);
        if (transactionsResult.length !== 0) {
            const totalPages = Math.ceil(countResult / limit);
            const currentPage = page;
            return res.status(200).json({
                res: true,
                totalResults: countResult,
                currentPage,
                totalPages,
                count: transactionsResult.length,
                data: transactionsResult,
            });
        } else {
            res.header(
                "X-Message",
                "No se encontraron resultados con los filtros indicados"
            );
            res.status(204);
            res.end();
        }
    } catch (err) {
        console.error("Error al ejecutar las consultas:", err);
    }
};

export const getTransactionsCountPerUser = async (req: Request, res: Response) => {
    const documents = await Transaction.aggregate([
        {
            $group: {
                _id: "$userId",
                totalDocumentos: { $sum: 1 },
            },
        },
        {
            $sort: { totalDocumentos: -1 },
        },
    ]);
    return res.status(200).json({
        documents,
    });
};

// export const autoComplete = async (req: Request, res: Response) => {
//     const text = req.query.text as string;
//     console.log(req.userId);
//     const query = {
//         ...(text && {
//             $search: {
//                 index: "autoComplete",
//                 autocomplete: {
//                     query: text,
//                     path: "nameOfTransaction",
//                     tokenOrder: "sequential",
//                 },
//             },
//         }),
//     };
//     console.log(query);
//     const transactions = await Transaction.aggregate([
//         {
//             $search: {
//                 index: "autoComplete",
//                 autocomplete: {
//                     query: text,
//                     path: "nameOfTransaction",
//                     tokenOrder: "sequential",
//                 },
//             },
//         },
//         {
//             $match: {
//                 userId: new mongoose.Types.ObjectId(req.userId),
//             },
//         },
//     ]);
//     return res.status(200).json({
//         count: transactions.length,
//         transactions,
//     });
// };
