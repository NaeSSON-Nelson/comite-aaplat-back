import { Injectable } from '@nestjs/common';
import { CloudinaryResponse } from './cloudinary-response';
import { v2 as cloudinary } from 'cloudinary';
// const streamifier = require('streamifier');
import * as streamifier from 'streamifier'
@Injectable()
export class CloudinaryService {
    uploadFile(file:Express.Multer.File):Promise<CloudinaryResponse>{
        return new Promise<CloudinaryResponse>((resolve,reject)=>{
            const uploadStream = cloudinary.uploader.upload_stream({
                folder:'userProfileImage',
                access_mode:'authenticated',
                use_filename:true,
                unique_filename:true,
            },(error,result)=>{
                    if(error) return reject(error);
                    resolve(result)
                }
            );
            streamifier.createReadStream(file.buffer).pipe(uploadStream);
        })
    }
    
    deleteFile(fullfilename:string){
        return new Promise<CloudinaryResponse>((resolve,reject)=>{
            return cloudinary.uploader.destroy(`userProfileImage/${fullfilename}`,(error,result)=>{
                if(error) return reject(error);
                resolve(result);
            })
        })
    }
}
