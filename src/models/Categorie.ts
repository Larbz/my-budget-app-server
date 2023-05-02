import { Document, Schema, model } from "mongoose";

export interface ICategorie extends Document{
  name:string;
  icon:string;
  color:string;
  presupuesto:number;
}

const categorieSchema = new Schema({
  name: {
    type: String,
    trim: true,
    required: [true, "Please add name for your categorie"],
  },
  icon: {
    type: String,
    required: [true, "Please add name for your categorie"],
  },
  color: {
    type: String,
    required: [true, "Please add name for your categorie"],
  },
  presupuesto: {
    type: Number,
    required: [true, "Please add name for your categorie"],
  },
});
export default model<ICategorie>("Categorie", categorieSchema);
