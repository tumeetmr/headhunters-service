export enum Role {
  COMPANY = 'COMPANY',
  RECRUITER = 'RECRUITER',
  ADMIN = 'ADMIN',
}

export enum RequestStatus {
  PENDING = 'PENDING',
  ACCEPTED = 'ACCEPTED',
  REJECTED = 'REJECTED',
}

export enum ProfileVisibility {
  DRAFT = 'DRAFT',
  PUBLISHED = 'PUBLISHED',
  ARCHIVED = 'ARCHIVED',
}

export enum RecruiterTagType {
  EXPERTISE = 'EXPERTISE',
  INDUSTRY = 'INDUSTRY',
  FOCUS_ROLE = 'FOCUS_ROLE',
  LANGUAGE = 'LANGUAGE',
  CERTIFICATION = 'CERTIFICATION',
  TOOL = 'TOOL',
}

export enum LinkType {
  EMAIL = 'EMAIL',
  PHONE = 'PHONE',
  WEBSITE = 'WEBSITE',
  LINKEDIN = 'LINKEDIN',
  WHATSAPP = 'WHATSAPP',
  TELEGRAM = 'TELEGRAM',
  CALENDAR = 'CALENDAR',
  OTHER = 'OTHER',
}

export enum ActiveSearchStatus {
  ACTIVE = 'ACTIVE',
  ON_HOLD = 'ON_HOLD',
  CLOSED = 'CLOSED',
}

export enum InsightStatus {
  DRAFT = 'DRAFT',
  PUBLISHED = 'PUBLISHED',
  COMING_SOON = 'COMING_SOON',
  ARCHIVED = 'ARCHIVED',
}

// ─── Form Fields ─────────────────────────────────────────

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
}
