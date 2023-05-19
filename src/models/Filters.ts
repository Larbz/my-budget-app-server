import mongoose from "mongoose";

export interface Filters{
    day?:number;
    month?:number;
    year?:number;
    date?:DateRange;
    amount?:AmountRange;
    userId:mongoose.Types.ObjectId;
    test?:Date;
    categoryId?:mongoose.Types.ObjectId;
    typeOfTransaction?:string;
}

type AmountRange={
    $gte?:number;
    $lte?:number;
}

type DateRange={
    $gte?:Date;
    $lte?:Date;
}