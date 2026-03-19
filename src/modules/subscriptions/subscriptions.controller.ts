import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  NotFoundException,
  UseGuards,
  Request,
} from '@nestjs/common';
import { SubscriptionsService } from './subscriptions.service';
import { Public } from '../auth/decorators/public.decorator';

@Controller('subscriptions')
export class SubscriptionsController {
  constructor(private readonly subscriptionsService: SubscriptionsService) {}

  /**
   * Get all active subscription plans
   */
  @Public()
  @Get('plans')
  async listPlans() {
    return this.subscriptionsService.listPlans();
  }

  /**
   * Get company's subscription by company ID
   */
  @Get('company/:companyId')
  async getByCompanyId(@Param('companyId') companyId: string) {
    return this.subscriptionsService.findByCompanyId(companyId);
  }

  /**
   * Get subscription for authenticated user's company
   */
  @Get('me')
  async getOwnSubscription(@Request() req: any) {
    const userId = req.user?.id;
    if (!userId) {
      throw new NotFoundException('User not authenticated');
    }
    return this.subscriptionsService.findByUserId(userId);
  }

  /**
   * Get company's subscription features
   */
  @Get('company/:companyId/features')
  async getCompanyFeatures(@Param('companyId') companyId: string) {
    const features = await this.subscriptionsService.getCompanyFeatures(companyId);
    return { companyId, features };
  }

  /**
   * Create or upgrade subscription for company
   */
  @Post('company/:companyId')
  async createOrUpdate(
    @Param('companyId') companyId: string,
    @Body() body: { planId: string },
  ) {
    return this.subscriptionsService.createOrUpdateSubscription(companyId, body.planId);
  }

  /**
   * Cancel subscription at end of period
   */
  @Post('company/:companyId/cancel-at-period-end')
  async cancelAtPeriodEnd(@Param('companyId') companyId: string) {
    return this.subscriptionsService.cancelAtPeriodEnd(companyId);
  }

  /**
   * Immediately cancel subscription
   */
  @Post('company/:companyId/cancel-immediate')
  async cancelImmediate(@Param('companyId') companyId: string) {
    return this.subscriptionsService.cancelImmediate(companyId);
  }

  /**
   * Check if company can perform an action
   */
  @Post('company/:companyId/can-perform/:action')
  async canPerformAction(
    @Param('companyId') companyId: string,
    @Param('action') action: string,
  ) {
    const allowed = await this.subscriptionsService.canPerformAction(
      companyId,
      action as any,
    );
    return { companyId, action, allowed };
  }
}
