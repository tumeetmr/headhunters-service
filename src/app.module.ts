import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { RecruitersModule } from './modules/recruiters/recruiters.module';
import { CompaniesModule } from './modules/companies/companies.module';
import { SkillsModule } from './modules/skills/skills.module';
import { RequestsModule } from './modules/requests/requests.module';
import { FormTemplatesModule } from './modules/form-templates/form-templates.module';
import { JwtAuthGuard } from './modules/auth/guards/jwt-auth.guard';
import { RolesGuard } from './modules/auth/guards/roles.guard';
import { SubscriptionsModule } from './modules/subscriptions/subscriptions.module';
import { JobOpeningsModule } from './modules/job-openings/job-openings.module';
import { ApplicationsModule } from './modules/applications/applications.module';
import { EngagementsModule } from './modules/engagements/engagements.module';
import { PlacementsModule } from './modules/placements/placements.module';
import { AdminModule } from './modules/admin/admin.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    AuthModule,
    UsersModule,
    RecruitersModule,
    CompaniesModule,
    SkillsModule,
    RequestsModule,
    FormTemplatesModule,
    SubscriptionsModule,
    JobOpeningsModule,
    ApplicationsModule,
    EngagementsModule,
    PlacementsModule,
    AdminModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    { provide: APP_GUARD, useClass: JwtAuthGuard },
    { provide: APP_GUARD, useClass: RolesGuard },
  ],
})
export class AppModule {}
