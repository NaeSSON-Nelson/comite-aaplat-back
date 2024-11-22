import { BadRequestException } from '@nestjs/common'
import {Request} from 'express'
import {v4 as uuidv4} from 'uuid'
export const fileFilter= (req:Request, file:Express.Multer.File, callback:Function)=>{
    // const newFileName = `${uuidv4()}-${file.originalname.replace(' ','-')}`
    if(!file) callback(new Error('File is empty'),false);

    const fileExtension = file.mimetype.split('/')[1];
    const validExtensions = ['jpg','jpeg','png'];
    if(validExtensions.includes(fileExtension)) return callback(null,true);
    else if(file.size> 1000*1000*10) return callback(new Error('max Size is 10MB'),false);
    
    return callback(null,false);
}