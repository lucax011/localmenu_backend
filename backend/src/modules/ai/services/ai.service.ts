/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';
import { PrismaService } from '../../prisma/services/prismaServiceSetup';
import * as fs from 'fs';
import FormData from 'form-data';
import * as path from 'path';
import { AxiosError, AxiosRequestConfig } from 'axios';

interface OcrItem {
  name: string;
  price?: number;
  description?: string;
}

interface OcrCategory {
  category: string;
  items: OcrItem[];
}

interface OcrResponse {
  // Defina a estrutura da resposta do OCR aqui
  data: OcrCategory[];
}

@Injectable()
export class AiService {
  private baseUrl = process.env.AI_SERVICE_URL || 'http://localhost:5001';

  constructor(
    private httpService: HttpService,
    private configService: ConfigService,
    private prisma: PrismaService,
  ) {}

  /**
   * Envia arquivo para microserviço OCR.
   * Espera resposta: { data: [{ category: string, items: [{ name, price?, description? }] }] }
   */
  async extractMenuFromImage(filepath: string): Promise<OcrCategory[]> {
    const abs = path.resolve(filepath);
    if (!fs.existsSync(abs)) {
      throw new InternalServerErrorException('Arquivo não encontrado para OCR');
    }

    const url = `${this.baseUrl}/ocr/menu`;
    const form = new FormData();
    form.append('file', fs.createReadStream(abs));

    const config: AxiosRequestConfig = {
      headers: {
        ...form.getHeaders(),
        'X-API-Key': this.configService.get<string>('OCR_API_KEY'),
      },
      maxContentLength: Infinity,
      maxBodyLength: Infinity,
    };

    try {
      // CORREÇÃO: Usando o httpService injetado com firstValueFrom.
      const { data } = await firstValueFrom(
        this.httpService.post<OcrResponse>(url, form, config),
      );
      // eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-member-access
      return data?.data || [];
    } catch (err: unknown) {
      let message = 'Erro desconhecido no OCR';
      if (err instanceof AxiosError) {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        const errorData = err.response?.data as { message?: string };
        message = errorData?.message || err.message;
      } else if (err instanceof Error) {
        message = err.message;
      }
      throw new InternalServerErrorException(
        'Falha na extração OCR: ' + message,
      );
    }
  }
}
