import {
  Controller,
  Post,
  Body,
  Get,
  Param,
  Patch,
  Query,
  UseGuards,
  Delete,
} from '@nestjs/common';
import { RestaurantsService } from '../services/restaurants.service';
import { CreateRestaurantDto } from '../dto/createRestaurant.dto';
import { UpdateRestaurantDto } from '../dto/updateRestaurante.dto';
import { JwtAuthGuard } from '../../common/guards/jwtAuth.guard';
import { Roles } from '../../auth/decorators/roles.decorator';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { CurrentUser } from '../../auth/decorators/currentUser.decorator';
import { User, UserType } from '@prisma/client';
import { ApiBearerAuth, ApiQuery, ApiTags } from '@nestjs/swagger';
import { CreateRestaurantHoursDto } from '../dto/createRestaurantHours.dto';

@ApiTags('Restaurants')
@Controller('restaurants')
export class RestaurantsController {
  constructor(private service: RestaurantsService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserType.OWNER)
  @ApiBearerAuth()
  create(@Body() dto: CreateRestaurantDto, @CurrentUser() user: User) {
    return this.service.create(user.id, dto);
  }

  @Get('me')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserType.OWNER)
  @ApiBearerAuth()
  mine(@CurrentUser() user: User) {
    return this.service.myRestaurants(user.id);
  }

  @Get(':id')
  getPublic(@Param('id') id: string) {
    return this.service.findPublic(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserType.OWNER)
  @ApiBearerAuth()
  update(
    @Param('id') id: string,
    @Body() dto: UpdateRestaurantDto,
    @CurrentUser() user: User,
  ) {
    return this.service.update(id, user.id, dto);
  }

  @Get()
  @ApiQuery({ name: 'lat', required: false, type: Number })
  @ApiQuery({ name: 'lng', required: false, type: Number })
  search(@Query('lat') lat?: string, @Query('lng') lng?: string) {
    if (lat && lng) {
      return this.service.searchNearby(parseFloat(lat), parseFloat(lng));
    }
    // Fallback para listar todos, com paginação
    return this.service.findAll();
  }

  // Hours Management
  @Post(':restaurantId/hours')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserType.OWNER)
  @ApiBearerAuth()
  addHours(
    @Param('restaurantId') restaurantId: string,
    @Body() dto: CreateRestaurantHoursDto,
    @CurrentUser() user: User,
  ) {
    return this.service.addOrUpdateHours(restaurantId, user.id, dto);
  }

  @Delete(':restaurantId/hours/:hourId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserType.OWNER)
  @ApiBearerAuth()
  deleteHour(
    @Param('restaurantId') restaurantId: string,
    @Param('hourId') hourId: string,
    @CurrentUser() user: User,
  ) {
    return this.service.deleteHour(restaurantId, hourId, user.id);
  }
}
