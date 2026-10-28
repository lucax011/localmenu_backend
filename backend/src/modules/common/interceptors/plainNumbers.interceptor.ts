import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { map, Observable } from 'rxjs';

// O Prisma devolve preços como Decimal, que vira texto no JSON ("24.9").
// Os apps recebem número: converte todo Decimal da resposta.
export function plainNumbers(value: unknown): unknown {
  if (Prisma.Decimal.isDecimal(value)) {
    return value.toNumber();
  }
  if (Array.isArray(value)) return value.map(plainNumbers);
  if (value && typeof value === 'object' && !(value instanceof Date)) {
    return Object.fromEntries(
      Object.entries(value).map(([k, v]) => [k, plainNumbers(v)]),
    );
  }
  return value;
}

@Injectable()
export class PlainNumbersInterceptor implements NestInterceptor {
  intercept(_ctx: ExecutionContext, next: CallHandler): Observable<unknown> {
    return next.handle().pipe(map(plainNumbers));
  }
}
