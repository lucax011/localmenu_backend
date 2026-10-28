import { ConflictException, Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/services/prismaServiceSetup';
import { CreateUserDto } from '../dto/createUser.dto';
import { UpdateUserDto } from '../dto/updateUser.dto';
import * as bcrypt from 'bcryptjs';
import { SAFE_USER_SELECT } from '../../common/utils/safeUser';

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) {}

  async findByEmail(email: string) {
    return this.prisma.user.findUnique({ where: { email } });
  }

  async findById(id: string) {
    return this.prisma.user.findUnique({ where: { id } });
  }

  async findSafeById(id: string) {
    return this.prisma.user.findUnique({
      where: { id },
      select: SAFE_USER_SELECT,
    });
  }

  async update(id: string, data: UpdateUserDto) {
    const updateData: Partial<UpdateUserDto> & { password?: string } = {
      ...data,
    };

    if (data.password) {
      updateData.password = await bcrypt.hash(data.password, 10);
    }

    return this.prisma.user.update({
      where: { id },
      data: updateData,
    });
  }

  async create(data: CreateUserDto) {
    const existing = await this.findByEmail(data.email);
    if (existing) {
      throw new ConflictException('Email já cadastrado');
    }
    const hashedPassword = await bcrypt.hash(data.password, 10);
    return this.prisma.user.create({
      data: {
        ...data,
        password: hashedPassword,
      },
    });
  }
}
