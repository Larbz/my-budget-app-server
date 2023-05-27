import { Document, Schema, model } from "mongoose";

export interface IImage extends Document {
    name: string;
    file:string
}

const imageSchema = new Schema({
    name:String,
    file:String
    // img: {
    //     data: Buffer,
    //     type: String,
    //     required: [true, "Please add your image"],
    // },
});

export default model<IImage>("Image", imageSchema);
