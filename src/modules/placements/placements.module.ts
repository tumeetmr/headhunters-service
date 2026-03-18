import { Module } from '@nestjs/common';
import { PlacementsService } from './placements.service';
import { PlacementsController } from './placements.controller';
import { PrismaModule } from '../../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [PlacementsController],
  providers: [PlacementsService],
  exports: [PlacementsService],
})
export class PlacementsModule {}
