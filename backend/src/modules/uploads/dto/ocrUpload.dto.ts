import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class OcrUploadDto {
  @ApiProperty({
    type: 'string',
    format: 'binary',
    description: 'Foto do cardápio (JPEG ou PNG, até 10 MB)',
  })
  file: any;

  @ApiProperty({ description: 'Restaurante dono do cardápio' })
  @IsNotEmpty()
  @IsString()
  restaurantId: string;
}
