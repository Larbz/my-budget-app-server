import { Request, Response } from "express";
import { UploadedFile } from "express-fileupload";
import Image, { IImage } from "../models/Image";

const toBase64 = (file:File) => new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = error => reject(error);
  });
export const uploadImage = async (req: Request, res: Response) => {
    const formData = req.body;
    if (!formData.file) {
        return res.status(400).json({ message: "No file uploaded" });
    }
    const file: UploadedFile = formData.file as UploadedFile;
    const image:IImage=new Image({file,name:'asd'})
    // console.log(image)
    const imageSaved = await image.save();
    //   console.log('File name:', file);
    //   console.log('File MIME type:', file.mimetype);
    //   console.log('File size:', file.size);

    // Resto del código para manejar el archivo

    res.json(imageSaved);
};



export const getImage = async (req:Request,res:Response)=>{
    
    const id=req.body.id
    const img=await Image.findById(id,{__v:0})
    // res.send(img)
    // const uint8Array = new Uint8Array(img?.data as ArrayBuffer);
    // const blob = new Blob([uint8Array], { type: 'image/jpeg' });
    // const imageUrl = URL.createObjectURL(blob);

    res.send(img)

}