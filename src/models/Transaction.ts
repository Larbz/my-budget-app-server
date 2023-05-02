import { Document, Schema, model, Types } from "mongoose";
import Categorie from "./Categorie";

export interface ITransaction extends Document {
    nameOfTransaction: string;
    amount: number;
    date: Date;
    typeOfTransaction: string;
    categoryId: Types.ObjectId;
    userId: Types.ObjectId;
    convertDate(date: Date): Date;
}

const transactionSchema = new Schema({
  nameOfTransaction: {
    type: String,
    trim: true,
    required: [true, "Please add a name for the transaction"],
  },
  amount: {
    type: Number,
    required: [true, "Please add an amount"],
    min: 0,
  },
  date: {
    type: Date,
    default: new Date(),
  },
  typeOfTransaction: {
    type: String,
    required: [true, "Please add the type of operation"],
  },
  categoryId: {
    type: Types.ObjectId,
    required: [true, "Please add a categoryId"],
    ref:Categorie
  },
  userId: {
    type: Types.ObjectId,
    required: [true, "Please add a userId"],
  }
});

transactionSchema.methods.convertDate = function (date:Date){
    return date.toLocaleDateString("en-GB");
}

export default model<ITransaction>("Transaction", transactionSchema);
