// auth/dto/auth-response.dto.ts
export class AuthResponseDto {
  accessToken: string;
  refreshToken: string;
  user: AuthResponseDto;
}