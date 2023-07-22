import AWS from "aws-sdk";
import { Request, Response } from "express";
import { UploadedFile } from "express-fileupload";
import fs from "fs";
import Image, { IImage } from "../models/Image";
import {config} from "../config/config"
const s3 = new AWS.S3({
    accessKeyId: config.AWS_PUBLIC_KEY,
    secretAccessKey: config.AWS_SECRET_KEY,
});

const toBase64 = (file: File) =>
    new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result);
        reader.onerror = (error) => reject(error);
    });
export const uploadImage = async (req: Request, res: Response) => {
    const formData = req.files;
    if (!formData?.file) {
        return res.status(400).json({ message: "No file uploaded" });
    }
    const resp: UploadedFile = formData.file as UploadedFile;
    const fileContent: Buffer = resp.data;
    // const fileContent = fs.readFileSync("D:/Downloads/cr7.jpeg")
    // const fileContent:UploadedFile = formData.file.data as UploadedFile
    // console.log(fileContent)
    console.log(resp)
    const params = {
        Bucket: config.AWS_BUCKET_NAME as string,
        Key: "catssd.jpg" as string, // File name you want to save as in S3
        Body: fileContent,
        ACL: "public-read",
        ContentType: resp.mimetype,
    };
    s3.upload(params, function (err: any, data: any) {
        if (err) {
            throw err;
        }
        console.log(`File uploaded successfully.`,data.Location);
    });
    // const file: UploadedFile = formData.file as UploadedFile;
    // const image:IImage=new Image({file,name:'asd'})
    // // console.log(image)
    // const imageSaved = await image.save();
    //   console.log('File name:', file);
    //   console.log('File MIME type:', file.mimetype);
    //   console.log('File size:', file.size);

    // Resto del código para manejar el archivo

    res.json("saved");
};

export const getImage = async (req: Request, res: Response) => {
    const id = req.body.id;
    const img = await Image.findById(id, { __v: 0 });
    // res.send(img)
    // const uint8Array = new Uint8Array(img?.data as ArrayBuffer);
    // const blob = new Blob([uint8Array], { type: 'image/jpeg' });
    // const imageUrl = URL.createObjectURL(blob);

    res.send(img);
};
