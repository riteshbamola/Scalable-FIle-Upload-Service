import mime from 'mime-types';
import { PutObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import s3 from '../config/s3.js';
import File from '../Models/File.js'
const ALLOWED_MIME_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "application/pdf"
];
const MAX_FILE_SIZE = 5*1024*1024

export const handleFileUpload = async (req,res)=>{
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
            expiresIn:60
        });

        await File.create({
            owner: userid,                 
            originalName: fileName,       
            mimeType,
            size: fileSize,                

            storage: {
              provider: "s3",
              bucket: process.env.AWS_BUCKET_NAME,
              key: key
            }
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
export const handleFileRetrieval = async (req,res)=>{
    try{
        const userid= req.user;
        const {fileID} = req.params;
        

        if(!fileID){
            return res.status(400).json({message:"Missing FileId"});
        }

        const newfile = await File.findById(fileID);
        if(!newfile){
            return res.status(400).json({message:"No file found"});
        }
        const key= newfile.storage.key;
        const command = new GetObjectCommand({
        Bucket: process.env.AWS_BUCKET_NAME,
        Key: key,
        ResponseContentDisposition: "attachment"
        });

        const signedUrl = await getSignedUrl(s3,command,{
            expiresIn:240
        });

        res.status(200).json({
            signedUrl,
        });
                
    }catch(err){
        return res.status(500).json({message:err.message});
    }
}


export const getAllFiles = async (req,res)=>{
    try{
        const id = req.user;

        if(!id){
            return res.status(400).json({message:"No User"});
        }

        const allFiles = await File.find({owner:id});
        if(!allFiles){
            return res.status(400).json({message:"No file found"});
        }

        // const fileNames = allFiles.map(file => file.originalName);
        return res.status(200).json({
            allFiles
        })
    } catch(err) {
        return res.status(500).json({message:err.message});
    }
}
