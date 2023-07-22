import bcrypt from "bcryptjs";
import { Document, Schema, model } from "mongoose";
export interface IUser extends Document {
    username: string;
    name: string;
    last_name: string;
    dni: string;
    email: string;
    password: string;
    encryptPassword(password: string): Promise<string>;
    validatePassword(password: string): Promise<boolean>;
}

const userSchema = new Schema({
    username: {
        type: String,
        required: true,
        min: 4,
        lowercase: true,
        unique:true
    },
    name: {
        type: String,
        trim: true,
        required: [true, "Please add your name"],
    },
    last_name: {
        type: String,
        trim: true,
        required: [true, "Please add your lastname"],
    },
    dni: {
        type: String,
        trim: true,
        required: [true, "Please add your DNI"],
        unique: true,
    },
    email: {
        type: String,
        unique: true,
        trim: true,
        required: [true, "Please add your email"],
        lowercase: true,
    },
    password: {
        type: String,
        trim: true,
        required: [true, "Please add your password"],
    },
});

userSchema.methods.encryptPassword = async (password: string): Promise<string> => {
    const salt = await bcrypt.genSalt(10);
    return bcrypt.hash(password, salt);
};

userSchema.methods.validatePassword = async function (password: string): Promise<boolean> {
    return await bcrypt.compare(password, this.password);
};

export default model<IUser>("User", userSchema);
