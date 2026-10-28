import {
  Controller,
  Post,
  UploadedFile,
  UseInterceptors,
  UseGuards,
  Body,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { randomUUID } from 'crypto';
import { User, UserType } from '@prisma/client';
import { ApiBearerAuth, ApiBody, ApiConsumes, ApiTags } from '@nestjs/swagger';
import { UploadsService } from '../services/uploads.service';
import { JwtAuthGuard } from '../../common/guards/jwtAuth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../auth/decorators/roles.decorator';
import { CurrentUser } from '../../auth/decorators/currentUser.decorator';
import { OcrUploadDto } from '../dto/ocrUpload.dto';

const EXTENSIONS: Record<string, string> = {
  'image/jpeg': '.jpg',
  'image/png': '.png',
};

@ApiTags('Uploads')
@Controller('uploads')
export class UploadsController {
  constructor(private readonly uploadsService: UploadsService) {}

  @Post('ocr')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserType.OWNER)
  @ApiBearerAuth()
  @ApiConsumes('multipart/form-data')
  @ApiBody({ type: OcrUploadDto })
  @UseInterceptors(
    FileInterceptor('file', {
      // nome aleatório: o nome enviado pelo usuário nunca vira caminho no disco
      storage: diskStorage({
        destination: './uploads',
        filename: (_req, file, cb) =>
          cb(null, `${randomUUID()}${EXTENSIONS[file.mimetype]}`),
      }),
      limits: { fileSize: 10 * 1024 * 1024 },
      fileFilter: (_req, file, cb) =>
        EXTENSIONS[file.mimetype]
          ? cb(null, true)
          : cb(new BadRequestException('Envie uma foto JPEG ou PNG.'), false),
    }),
  )
  async ocrUpload(
    @UploadedFile() file: Express.Multer.File,
    @Body() body: OcrUploadDto,
    @CurrentUser() user: User,
  ) {
    if (!file)
      throw new BadRequestException(
        'Envie a foto do cardápio no campo "file".',
      );
    return this.uploadsService.processMenuWithOCR(
      file,
      body.restaurantId,
      user,
    );
  }
}
