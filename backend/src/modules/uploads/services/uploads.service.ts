import { Injectable, NotFoundException } from '@nestjs/common';
import * as path from 'path';
import * as fs from 'fs';
// CORREÇÃO: Ajustando o caminho de importação para um local mais provável.
import { PrismaService } from '../../prisma/services/prismaServiceSetup';
import { AiService } from '../../ai/services/ai.service';
import { User } from '@prisma/client';

@Injectable()
export class UploadsService {
  private baseDir = path.resolve(process.cwd(), 'uploads');

  constructor(
    private readonly prisma: PrismaService,
    private readonly aiService: AiService,
  ) {
    if (!fs.existsSync(this.baseDir)) {
      fs.mkdirSync(this.baseDir, { recursive: true });
    }
  }

  buildFileUrl(filename: string) {
    return `/static/${filename}`; // Ex: servir via middleware express static
  }

  async saveBuffer(originalName: string, buffer: Buffer) {
    const ext = path.extname(originalName) || '.bin';
    const name = `${Date.now()}-${Math.random().toString(36).slice(2)}${ext}`;
    const full = path.join(this.baseDir, name);
    await fs.promises.writeFile(full, buffer);
    return { filename: name, path: full, url: this.buildFileUrl(name) };
  }

  async processMenuWithOCR(
    filePath: string,
    restaurantId: string,
    user: User,
    menuName: string,
  ) {
    const restaurant = await this.prisma.restaurant.findUnique({
      where: { id: restaurantId },
    });

    if (!restaurant || restaurant.ownerId !== user.id) {
      throw new NotFoundException(
        `Restaurant with ID ${restaurantId} not found or you don't have permission.`,
      );
    }

    // 1. Criar ou encontrar o menu
    const menu = await this.prisma.menu.upsert({
      where: {
        // CORREÇÃO: A sintaxe para índice composto é um objeto aninhado.
        restaurantId_name: {
          restaurantId,
          name: menuName,
        },
      },
      update: {},
      create: {
        restaurantId,
        name: menuName,
      },
    });

    // 2. Criar o registro de upload
    const menuUpload = await this.prisma.menuUpload.create({
      data: {
        menuId: menu.id,
        // CORREÇÃO: O schema não tem 'filePath'. Os campos são 's3Key', 's3Url', etc.
        // Ajuste conforme sua lógica para salvar o arquivo.
        originalName: path.basename(filePath),
        s3Key: filePath, // ou a chave do S3
        s3Url: this.buildFileUrl(path.basename(filePath)),
        fileType: path.extname(filePath),
        fileSize: fs.statSync(filePath).size,
        status: 'PENDING',
      },
    });

    // 3. Iniciar o processamento de IA
    void this.aiService
      .extractMenuFromImage(filePath)
      .catch((err) =>
        console.error(`OCR processing failed for ${filePath}:`, err),
      );

    return {
      message: 'Upload received and processing started.',
      uploadId: menuUpload.id,
    };
  }
}
