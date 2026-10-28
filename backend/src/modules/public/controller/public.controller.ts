import { Controller, Get, Param } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { PublicService } from '../services/public.service';

@ApiTags('Public')
@Controller('public')
export class PublicController {
  constructor(private service: PublicService) {}

  @Get('restaurants')
  restaurants() {
    return this.service.listRestaurants();
  }

  @Get('r/:slug')
  restaurant(@Param('slug') slug: string) {
    return this.service.restaurantBySlug(slug);
  }
}
