import { Module } from '@nestjs/common';
import { CloudinaryService } from './cloudinary.service';
import { CloudinaryProvider } from './cloudinary/cloudinary';

@Module({
  providers: [CloudinaryService, CloudinaryProvider],
  exports:[CloudinaryService,CloudinaryProvider],
})
export class CloudinaryModule {}
