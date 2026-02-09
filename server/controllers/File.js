import mime from 'mime-types';
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import s3 from '../config/s3.js';


const ALLOWED_MIME_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "application/pdf"
];
const MAX_FILE_SIZE = 5*1024*1024

export const handleFileUpload = async (req,res)=>{
    console.log("Hit");
    try{
        const userid= req.user;
        const {fileName,fileSize}= req.body;

        if(!fileName || !fileSize){
            return res.status(400).json({message:"Missing File data"});
        }


        // MIME VALIDATION;
        const mimeType = mime.lookup(fileName);

        if(!mimeType || !ALLOWED_MIME_TYPES.includes(mimeType)){
            return res.status(400).json({ message: "Invalid file type" });
        }

        //FILE SIZE VALIDATION

        if(fileSize > MAX_FILE_SIZE){
            return res.status(400).json({message:"FileSize Should be under 5mb"})
        }
        
        const extension = mime.extension(mimeType);
        const key = `uploads/${userid}/${Date.now()}.${extension}`;

        const command = new PutObjectCommand({
        Bucket: process.env.AWS_BUCKET_NAME,
        Key: key,
        ContentType: mimeType
        });

        const uploadURL = await getSignedUrl(s3,command,{
            expiresIn:360
        });

        res.status(200).json({
            uploadURL,
            key,
            mimeType
        });
        
    }catch(err){
        return res.status(500).json({message:err.message});
    }
    
}