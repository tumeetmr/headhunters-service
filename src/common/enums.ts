// ─────────────────────────────────────────────────────────────────────────────
// USER & AUTH
// ─────────────────────────────────────────────────────────────────────────────

export enum Role {
  RECRUITER = 'RECRUITER',
  COMPANY = 'COMPANY',
  ADMIN = 'ADMIN',
}

// ─────────────────────────────────────────────────────────────────────────────
// SUBSCRIPTION & BILLING
// ─────────────────────────────────────────────────────────────────────────────

export enum BillingInterval {
  MONTHLY = 'MONTHLY',
  YEARLY = 'YEARLY',
}

export enum SubscriptionStatus {
  ACTIVE = 'ACTIVE',
  CANCELLED = 'CANCELLED',
  EXPIRED = 'EXPIRED',
}

export enum CompanyPlanName {
  BASIC = 'BASIC',
  GROWTH = 'GROWTH',
  ENTERPRISE = 'ENTERPRISE',
}

export enum PaymentStatus {
  PENDING = 'PENDING',
  SUCCEEDED = 'SUCCEEDED',
  FAILED = 'FAILED',
}

// Company Plan Features Interface
export interface CompanyPlanFeatures {
  max_active_projects: number;      // -1 = unlimited
  max_proposals_viewable: number;   // -1 = unlimited
  can_direct_message: boolean;
  can_shortlist: boolean;
  can_post_recruit_request: boolean;
  featured_projects: number;
  dedicated_account_manager: boolean;
  analytics_access: boolean;
}

// Default Plan Features
export const DEFAULT_PLAN_FEATURES: Record<CompanyPlanName, CompanyPlanFeatures> = {
  [CompanyPlanName.BASIC]: {
    max_active_projects: 1,
    max_proposals_viewable: 3,
    can_direct_message: false,
    can_shortlist: false,
    can_post_recruit_request: false,
    featured_projects: 0,
    dedicated_account_manager: false,
    analytics_access: false,
  },
  [CompanyPlanName.GROWTH]: {
    max_active_projects: 5,
    max_proposals_viewable: -1,
    can_direct_message: true,
    can_shortlist: true,
    can_post_recruit_request: true,
    featured_projects: 2,
    dedicated_account_manager: false,
    analytics_access: true,
  },
  [CompanyPlanName.ENTERPRISE]: {
    max_active_projects: -1,
    max_proposals_viewable: -1,
    can_direct_message: true,
    can_shortlist: true,
    can_post_recruit_request: true,
    featured_projects: 10,
    dedicated_account_manager: true,
    analytics_access: true,
  },
};

// ─────────────────────────────────────────────────────────────────────────────
// PROFILE
// ─────────────────────────────────────────────────────────────────────────────

export enum ProfileVisibility {
  DRAFT = 'DRAFT',
  PUBLISHED = 'PUBLISHED',
  ARCHIVED = 'ARCHIVED',
}

export enum CompanySize {
  STARTUP = 'STARTUP',
  SMALL = 'SMALL',
  MEDIUM = 'MEDIUM',
  LARGE = 'LARGE',
  ENTERPRISE = 'ENTERPRISE',
}

export enum LinkType {
  LINKEDIN = 'LINKEDIN',
  PORTFOLIO = 'PORTFOLIO',
  GITHUB = 'GITHUB',
  TWITTER = 'TWITTER',
  WEBSITE = 'WEBSITE',
  OTHER = 'OTHER',
}

// ─────────────────────────────────────────────────────────────────────────────
// RECRUITER ONBOARDING
// ─────────────────────────────────────────────────────────────────────────────

export enum JoinType {
  APPLICATION = 'APPLICATION',
  INVITED = 'INVITED',
  INTERNAL = 'INTERNAL',
}

export enum RecruiterApplicationStatus {
  PENDING = 'PENDING',
  REVIEWING = 'REVIEWING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
}

// ─────────────────────────────────────────────────────────────────────────────
// SKILLS & TAGS
// ─────────────────────────────────────────────────────────────────────────────

export enum SkillType {
  SKILL = 'SKILL',
  INDUSTRY = 'INDUSTRY',
  EXPERTISE = 'EXPERTISE',
  LANGUAGE = 'LANGUAGE',
  CERTIFICATION = 'CERTIFICATION',
}

// ─────────────────────────────────────────────────────────────────────────────
// ACTIVE SEARCH & INSIGHTS
// ─────────────────────────────────────────────────────────────────────────────

export enum ActiveSearchStatus {
  ACTIVE = 'ACTIVE',
  FILLED = 'FILLED',
  CLOSED = 'CLOSED',
  ON_HOLD = 'ON_HOLD',
}

export enum InsightStatus {
  DRAFT = 'DRAFT',
  PUBLISHED = 'PUBLISHED',
  ARCHIVED = 'ARCHIVED',
}

// ─────────────────────────────────────────────────────────────────────────────
// FORMS
// ─────────────────────────────────────────────────────────────────────────────

export enum FormFieldType {
  TEXT = 'TEXT',
  TEXTAREA = 'TEXTAREA',
  EMAIL = 'EMAIL',
  PHONE = 'PHONE',
  NUMBER = 'NUMBER',
  SELECT = 'SELECT',
  MULTI_SELECT = 'MULTI_SELECT',
  CHECKBOX = 'CHECKBOX',
  DATE = 'DATE',
  FILE = 'FILE',
}

export enum RequestStatus {
  PENDING = 'PENDING',
  COMPLETED = 'COMPLETED',
  DECLINED = 'DECLINED',
}

// ─────────────────────────────────────────────────────────────────────────────
// RECRUITMENT & HIRING
// ─────────────────────────────────────────────────────────────────────────────

export enum EmploymentType {
  FULL_TIME = 'FULL_TIME',
  PART_TIME = 'PART_TIME',
  CONTRACT = 'CONTRACT',
}

export enum SeniorityLevel {
  JUNIOR = 'JUNIOR',
  MID = 'MID',
  SENIOR = 'SENIOR',
  LEAD = 'LEAD',
  EXECUTIVE = 'EXECUTIVE',
}

export enum FeeType {
  PERCENTAGE = 'PERCENTAGE',
  FIXED = 'FIXED',
}

export enum JobOpeningStatus {
  OPEN = 'OPEN',
  IN_PROGRESS = 'IN_PROGRESS',
  FILLED = 'FILLED',
  ON_HOLD = 'ON_HOLD',
  CANCELLED = 'CANCELLED',
}

export enum ApplicationStatus {
  PENDING = 'PENDING',
  ACCEPTED = 'ACCEPTED',
  REJECTED = 'REJECTED',
  WITHDRAWN = 'WITHDRAWN',
}

export enum EngagementStatus {
  ACTIVE = 'ACTIVE',
  FILLED = 'FILLED',
  CLOSED = 'CLOSED',
  CANCELLED = 'CANCELLED',
}

// ─────────────────────────────────────────────────────────────────────────────
// PLACEMENTS & INVOICES
// ─────────────────────────────────────────────────────────────────────────────

export enum PlacementStatus {
  PENDING = 'PENDING',
  OFFERED = 'OFFERED',
  ACCEPTED = 'ACCEPTED',
  STARTED = 'STARTED',
  GUARANTEED = 'GUARANTEED',
  CANCELLED = 'CANCELLED',
}

export enum InvoiceStatus {
  DRAFT = 'DRAFT',
  SENT = 'SENT',
  PAID = 'PAID',
  OVERDUE = 'OVERDUE',
  CANCELLED = 'CANCELLED',
}

// ─────────────────────────────────────────────────────────────────────────────
// NOTIFICATIONS
// ─────────────────────────────────────────────────────────────────────────────

export enum NotificationType {
  // Applications
  APPLICATION_RECEIVED = 'APPLICATION_RECEIVED',
  APPLICATION_ACCEPTED = 'APPLICATION_ACCEPTED',
  APPLICATION_REJECTED = 'APPLICATION_REJECTED',
  APPLICATION_WITHDRAWN = 'APPLICATION_WITHDRAWN',
  // Engagements
  ENGAGEMENT_STARTED = 'ENGAGEMENT_STARTED',
  ENGAGEMENT_CLOSED = 'ENGAGEMENT_CLOSED',
  ENGAGEMENT_FILLED = 'ENGAGEMENT_FILLED',
  // Placements
  PLACEMENT_OFFERED = 'PLACEMENT_OFFERED',
  PLACEMENT_ACCEPTED = 'PLACEMENT_ACCEPTED',
  PLACEMENT_STARTED = 'PLACEMENT_STARTED',
  PLACEMENT_GUARANTEED = 'PLACEMENT_GUARANTEED',
  // Invoices
  INVOICE_SENT = 'INVOICE_SENT',
  INVOICE_PAID = 'INVOICE_PAID',
  INVOICE_OVERDUE = 'INVOICE_OVERDUE',
  // Messages
  NEW_MESSAGE = 'NEW_MESSAGE',
  // Reviews
  REVIEW_RECEIVED = 'REVIEW_RECEIVED',
  // Requests
  RECRUIT_REQUEST_RECEIVED = 'RECRUIT_REQUEST_RECEIVED',
  RECRUIT_REQUEST_UPDATED = 'RECRUIT_REQUEST_UPDATED',
  // System
  SYSTEM_ANNOUNCEMENT = 'SYSTEM_ANNOUNCEMENT',
}

// ─────────────────────────────────────────────────────────────────────────────
// AUDIT LOG
// ─────────────────────────────────────────────────────────────────────────────

export enum AuditAction {
  CREATED = 'CREATED',
  UPDATED = 'UPDATED',
  DELETED = 'DELETED',
  STATUS_CHANGED = 'STATUS_CHANGED',
}