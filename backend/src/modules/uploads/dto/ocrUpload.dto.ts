import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class OcrUploadDto {
  @ApiProperty({
    type: 'string',
    format: 'binary',
    description: 'Image file of the menu',
  })
  file: any;

  @ApiProperty({
    description: 'The ID of the restaurant this menu belongs to',
    example: 'clq8k2x2f0000c8s6g6g6g6g6',
  })
  @IsNotEmpty()
  @IsString()
  restaurantId: string;

  @ApiProperty({
    description: 'The name for the new menu being created',
    example: 'Lunch Menu',
  })
  @IsNotEmpty()
  @IsString()
  menuName: string;
}
