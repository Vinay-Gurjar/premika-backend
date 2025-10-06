import { PutObjectCommand } from "@aws-sdk/client-s3";
import { S3Client } from "@aws-sdk/client-s3";
import 'dotenv/config';
import { readFile } from "fs/promises";
import { getShortUUID, sendResponse } from "./application.js";

export const uploadFile = async (key, filePath) => {
    try {
        const client = new S3Client({
            region: process.env.AWS_REGION,
            credentials: {
                accessKeyId: process.env.AWS_ACCESS_KEY,
                secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
            }
        });

        const command = new PutObjectCommand({
            Bucket: process.env.BUCKET_NAME,
            Key: key,
            Body: await readFile(filePath),
        });

        const response = await client.send(command);
        return response;
    } catch (error) {
        throw error
    }
}


export const fileUploader = async (req, res) => {
    try {
        const file = req?.files?.file
        const {type = "profile_image"} = req.query || {};
        let uploadPath = "";
        const date = new Date();
        const id = getShortUUID()
        

        switch(type){
            case "profile_image":
                uploadPath = `document/profile_image/${date.toISOString()}/${id}/${file?.name}`
                break;
            default:
                uploadPath = `image/app_logo/${file?.name}`
                break;
        }

        await uploadFile(uploadPath, file?.tempFilePath)

        const bucket_name = process.env.BUCKET_NAME
        const region = process.env.AWS_REGION
        
        const url = `https://${bucket_name}.s3.${region}.amazonaws.com/${uploadPath}`

        sendResponse(true, res, url, "File uploaded successfully")
    } catch (error) {
        console.log(error, 'error uploading image')
        sendResponse(false, res, error , error?.message);
    }
}