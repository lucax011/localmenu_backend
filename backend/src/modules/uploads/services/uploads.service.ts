import { Injectable } from '@nestjs/common';
import * as path from 'path';
import { AIJobStatus, UploadStatus, User } from '@prisma/client';
import { PrismaService } from '../../prisma/services/prismaServiceSetup';
import { AiService } from '../../ai/services/ai.service';
import { MenusService } from '../../menus/services/menus.service';

// Importação por foto, em duas etapas:
// 1. aqui: guarda a foto, roda o OCR e devolve os itens lidos (nada entra no cardápio)
// 2. o dono revisa no app e publica em POST /menus/:menuId/import
@Injectable()
export class UploadsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly aiService: AiService,
    private readonly menusService: MenusService,
  ) {}

  async processMenuWithOCR(
    file: Express.Multer.File,
    restaurantId: string,
    user: User,
  ) {
    await this.menusService.ensureRestaurantOwner(restaurantId, user.id);
    const menu = await this.menusService.mainMenu(restaurantId);

    const upload = await this.prisma.menuUpload.create({
      data: {
        menuId: menu.id,
        originalName: file.originalname.slice(0, 200),
        s3Key: file.path, // armazenamento local nesta fase (sem nuvem)
        s3Url: `/static/${path.basename(file.path)}`,
        fileType: file.mimetype,
        fileSize: file.size,
        status: UploadStatus.PROCESSING,
        aiJob: {
          create: { status: AIJobStatus.PROCESSING, startedAt: new Date() },
        },
      },
      include: { aiJob: true },
    });

    try {
      const result = await this.aiService.extractMenuFromImage(
        file.path,
        file.mimetype,
      );
      const confidence = result.items.length
        ? result.items.reduce((acc, i) => acc + i.confidence, 0) /
          result.items.length
        : null;
      await this.prisma.menuUpload.update({
        where: { id: upload.id },
        data: {
          status: UploadStatus.COMPLETED,
          processedAt: new Date(),
          aiJob: {
            update: {
              status: AIJobStatus.COMPLETED,
              completedAt: new Date(),
              structuredData: result.items as object[],
              confidence,
            },
          },
        },
      });
      return {
        uploadId: upload.id,
        menuId: menu.id,
        imageUrl: upload.s3Url,
        items: result.items,
      };
    } catch (err) {
      await this.prisma.menuUpload.update({
        where: { id: upload.id },
        data: {
          status: UploadStatus.FAILED,
          aiJob: {
            update: {
              status: AIJobStatus.FAILED,
              completedAt: new Date(),
              errorMessage: err instanceof Error ? err.message : String(err),
            },
          },
        },
      });
      throw err;
    }
  }
}
