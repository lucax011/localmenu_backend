import { applyDecorators } from '@nestjs/common';
import { IsOptional, Matches, MaxLength } from 'class-validator';

// Foto enviada por POST /uploads/image (/static/<uuid>.jpg) ou endereço https.
// null apaga a foto.
export const IMAGE_URL =
  /^(https:\/\/[^\s"'<>]+|\/static\/[0-9a-f-]{36}\.(jpg|png))$/;

export const IsImageUrl = () =>
  applyDecorators(
    IsOptional(),
    MaxLength(500),
    Matches(IMAGE_URL, {
      message:
        'A foto deve ser um endereço https ou um arquivo enviado em /uploads/image.',
    }),
  );
