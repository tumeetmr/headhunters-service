import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { DEFAULT_PLAN_FEATURES, CompanyPlanFeatures, SubscriptionStatus } from '../../common/enums';

@Injectable()
export class SubscriptionsService {
  constructor(private prisma: PrismaService) {}

  /**
   * Get all active subscription plans
   */
  async listPlans() {
    return this.prisma.subscriptionPlan.findMany({
      where: { isActive: true },
      orderBy: { price: 'asc' },
    });
  }

  /**
   * Create subscription for a company
   * If company already has a subscription, upgrade/downgrade it
   */
  async createOrUpdateSubscription(companyId: string, planId: string) {
    // Verify company exists
    const company = await this.prisma.company.findUnique({
      where: { id: companyId },
    });

    if (!company) {
      throw new NotFoundException('Company not found');
    }

    // Verify plan exists
    const plan = await this.prisma.subscriptionPlan.findUnique({
      where: { id: planId },
    });

    if (!plan) {
      throw new NotFoundException('Subscription plan not found');
    }

    // Check if company already has a subscription
    const existing = await this.prisma.subscription.findUnique({
      where: { companyId },
    });

    if (existing) {
      // Update existing subscription (upgrade/downgrade)
      return this.prisma.subscription.update({
        where: { id: existing.id },
        data: {
          planId,
          status: 'ACTIVE',
          cancelAtPeriodEnd: false,
        },
        include: { plan: true, company: true },
      });
    }

    // Create new subscription with BASIC plan as default
    return this.prisma.subscription.create({
      data: {
        companyId,
        planId,
        status: 'ACTIVE',
        startDate: new Date(),
      },
      include: { plan: true, company: true },
    });
  }

  /**
   * Get company's active subscription with all details
   */
  async findByCompanyId(companyId: string) {
    const subscription = await this.prisma.subscription.findUnique({
      where: { companyId },
      include: {
        plan: true,
        company: true,
        payments: {
          orderBy: { createdAt: 'desc' },
          take: 10,
        },
      },
    });

    if (!subscription) {
      throw new NotFoundException('No subscription found for this company');
    }

    return subscription;
  }

  /**
   * Get company subscription via user (company owner)
   */
  async findByUserId(userId: string) {
    const company = await this.prisma.company.findUnique({
      where: { userId },
    });

    if (!company) {
      throw new NotFoundException('Company not found for this user');
    }

    return this.findByCompanyId(company.id);
  }

  /**
   * Cancel company subscription at end of period
   */
  async cancelAtPeriodEnd(companyId: string) {
    const subscription = await this.prisma.subscription.findUnique({
      where: { companyId },
    });

    if (!subscription) {
      throw new NotFoundException('Subscription not found');
    }

    if (subscription.status === 'CANCELLED') {
      throw new BadRequestException('Subscription is already cancelled');
    }

    return this.prisma.subscription.update({
      where: { id: subscription.id },
      data: { cancelAtPeriodEnd: true },
      include: { plan: true },
    });
  }

  /**
   * Immediately cancel subscription
   */
  async cancelImmediate(companyId: string) {
    const subscription = await this.prisma.subscription.findUnique({
      where: { companyId },
    });

    if (!subscription) {
      throw new NotFoundException('Subscription not found');
    }

    return this.prisma.subscription.update({
      where: { id: subscription.id },
      data: {
        status: 'CANCELLED',
        endDate: new Date(),
        cancelAtPeriodEnd: false,
      },
      include: { plan: true },
    });
  }

  /**
   * Get company features from their subscription
   */
  async getCompanyFeatures(companyId: string): Promise<CompanyPlanFeatures> {
    const subscription = await this.findByCompanyId(companyId);

    if (!subscription || subscription.status !== 'ACTIVE') {
      // Return default BASIC features if no active subscription
      return DEFAULT_PLAN_FEATURES.BASIC;
    }

    // Parse features from JSON, fallback to defaults if not found
    const features = subscription.plan.features as CompanyPlanFeatures | null;
    return features || DEFAULT_PLAN_FEATURES.BASIC;
  }

  /**
   * Check if company can perform an action based on subscription features
   */
  async canPerformAction(companyId: string, action: keyof CompanyPlanFeatures): Promise<boolean> {
    const features = await this.getCompanyFeatures(companyId);

    const featureValue = features[action];

    // Boolean checks
    if (typeof featureValue === 'boolean') {
      return featureValue;
    }

    // Number checks (only fail if it's 0, which means not allowed)
    if (typeof featureValue === 'number') {
      return featureValue !== 0;
    }

    return false;
  }

  /**
   * Check if company has reached limit (e.g., active projects)
   */
  async checkLimitReached(
    companyId: string,
    limitKey: 'max_active_projects' | 'max_proposals_viewable' | 'featured_projects',
    currentCount: number,
  ): Promise<boolean> {
    const features = await this.getCompanyFeatures(companyId);
    const limit = features[limitKey] as number;

    // -1 means unlimited
    if (limit === -1) return false;

    return currentCount >= limit;
  }
}
