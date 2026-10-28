import { BadGatewayException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as fs from 'fs';
import * as path from 'path';

// Item como o serviço de OCR devolve (localmenu_OCRservice, POST /ocr/extract)
export interface OcrItem {
  name: string;
  price: number;
  description: string | null;
  category: string | null;
  confidence: number;
}

interface OcrResponse {
  items: OcrItem[];
  metadata: { engine: string; processing_ms: number };
}

@Injectable()
export class AiService {
  constructor(private configService: ConfigService) {}

  private get baseUrl() {
    return (
      this.configService.get<string>('AI_SERVICE_URL') ||
      'http://localhost:8000'
    );
  }

  // Envia a foto ao serviço de OCR e devolve os itens lidos
  async extractMenuFromImage(
    filePath: string,
    mimeType: string,
  ): Promise<OcrResponse> {
    const buffer = await fs.promises.readFile(filePath);
    const form = new FormData();
    form.append(
      'file',
      new Blob([new Uint8Array(buffer)], { type: mimeType }),
      path.basename(filePath),
    );

    let response: Response;
    try {
      response = await fetch(`${this.baseUrl}/ocr/extract`, {
        method: 'POST',
        body: form,
        signal: AbortSignal.timeout(60_000),
      });
    } catch {
      throw new BadGatewayException(
        'O serviço de OCR não respondeu. Ele está rodando?',
      );
    }
    if (!response.ok) {
      const detail = await response.text();
      throw new BadGatewayException(
        `O OCR recusou a imagem (${response.status}): ${detail.slice(0, 200)}`,
      );
    }
    return (await response.json()) as OcrResponse;
  }
}
