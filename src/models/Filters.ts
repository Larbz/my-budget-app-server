import mongoose from "mongoose";

export interface Filters{
    day?:number;
    month?:number;
    year?:number;
    userId:mongoose.Types.ObjectId;
}