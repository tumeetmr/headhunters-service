import { Module } from '@nestjs/common';
import { JobOpeningsService } from './job-openings.service';
import { JobOpeningsController } from './job-openings.controller';
import { PrismaModule } from '../../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [JobOpeningsController],
  providers: [JobOpeningsService],
  exports: [JobOpeningsService],
})
export class JobOpeningsModule {}
