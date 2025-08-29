import { UserResponseDto } from '../../users/dto/userResponse.dto';

// auth/dto/auth-response.dto.ts
export class AuthResponseDto {
  accessToken: string; 
  user: UserResponseDto;
} //sem refreshToken