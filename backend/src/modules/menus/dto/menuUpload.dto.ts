import { IsString, IsEnum, IsNumber } from 'class-validator';

// menu/dto/menu-upload.dto.ts
export class MenuUploadDto {
  @IsString()
  restaurantId: string;

  @IsString()
  name: string;

  @IsString()
  originalName: string;

  @IsString()
  s3Key: string;

  @IsString()
  s3Url: string;

  @IsEnum(['PDF', 'JPG', 'PNG', 'JPEG'])
  fileType: 'PDF' | 'JPG' | 'PNG' | 'JPEG';

  @IsNumber()
  fileSize: number;
}
