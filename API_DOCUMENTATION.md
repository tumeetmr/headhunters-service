# Headhunters Service — Backend API Documentation

> **Base URL:** `http://localhost:3000`
> **Auth:** JWT Bearer token via `Authorization: Bearer <token>` header
> **Content-Type:** `application/json`

---

## Table of Contents

1. [Authentication](#1-authentication)
2. [Users](#2-users)
3. [Recruiter Profiles](#3-recruiter-profiles)
4. [Companies](#4-companies)
5. [Skills](#5-skills)
6. [Recruit Requests](#6-recruit-requests)
7. [Form Templates](#7-form-templates)
8. [Enums & Constants](#8-enums--constants)
9. [Error Handling](#9-error-handling)
10. [Data Models](#10-data-models)

---

## 1. Authentication

All endpoints require a valid JWT unless marked **Public**. The JWT payload contains `{ sub: userId, email, role }`.

### `POST /auth/register` — **Public**

Register a new user account. Returns a JWT access token.

**Request Body:**
```json
{
  "email": "string (valid email, required)",
  "password": "string (min 6 chars, required)",
  "name": "string (required)",
  "role": "COMPANY | RECRUITER | ADMIN (required)"
}
```

**Response `201`:**
```json
{
  "accessToken": "eyJhbGciOi...",
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "role": "RECRUITER"
  }
}
```

**Errors:** `409 Conflict` if email already registered.

---

### `POST /auth/login` — **Public**

Authenticate and receive a JWT.

**Request Body:**
```json
{
  "email": "string (valid email, required)",
  "password": "string (required)"
}
```

**Response `201`:**
```json
{
  "accessToken": "eyJhbGciOi...",
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "role": "COMPANY"
  }
}
```

**Errors:** `401 Unauthorized` if credentials are invalid.

---

### `GET /auth/me` — **Requires JWT**

Get the authenticated user's profile, including linked recruiter profile or company.

**Response `200`:**
```json
{
  "id": "uuid",
  "email": "user@example.com",
  "name": "John Doe",
  "role": "RECRUITER",
  "createdAt": "2026-03-11T00:00:00.000Z",
  "recruiterProfile": { "..." } | null,
  "company": { "..." } | null
}
```

---

## 2. Users

> **All endpoints require role: `ADMIN`**

### `POST /users`

Create a new user.

**Request Body:**
```json
{
  "email": "string (valid email, required)",
  "password": "string (min 6 chars, required)",
  "name": "string (required)",
  "role": "COMPANY | RECRUITER | ADMIN (required)"
}
```

### `GET /users`

List all users, ordered by `createdAt` descending.

**Response `200`:** `User[]`

### `GET /users/:id`

Get a single user with their `recruiterProfile` and `company` relations included.

**Params:** `id` — UUID

### `PUT /users/:id`

Update a user. All fields optional.

**Request Body:**
```json
{
  "email?": "string",
  "password?": "string (min 6 chars)",
  "name?": "string",
  "role?": "COMPANY | RECRUITER | ADMIN"
}
```

### `DELETE /users/:id`

Delete a user.

---

## 3. Recruiter Profiles

### `POST /recruiters` — **Roles: RECRUITER, ADMIN**

Create a recruiter profile.

**Request Body:**
```json
{
  "userId": "uuid (required)",
  "slug?": "string (unique URL slug)",
  "title?": "string",
  "tagline?": "string",
  "bio?": "string",
  "photoUrl?": "string (URL)",
  "heroImageUrl?": "string (URL)",
  "yearsExperience?": "integer (>= 0)",
  "isLeadPartner?": "boolean (default: false)",
  "partnerBadge?": "string",
  "publicEmail?": "string",
  "publicPhone?": "string",
  "location?": "string",
  "timezone?": "string",
  "rating?": "number (default: 0)",
  "visibility?": "DRAFT | PUBLISHED | ARCHIVED (default: DRAFT)",
  "skillIds?": ["uuid", "uuid"]
}
```

**Response:** Full profile with `skills`, `tags`, `links`, `activeSearches`, `insights` included.

### `GET /recruiters` — **Public**

List all recruiter profiles.

**Query Params:**
| Param | Type | Description |
|-------|------|-------------|
| `visibility` | string | Filter by visibility: `DRAFT`, `PUBLISHED`, `ARCHIVED` |

**Response `200`:** `RecruiterProfile[]` (each with skills, tags, links, activeSearches, insights)

### `GET /recruiters/slug/:slug` — **Public**

Get a recruiter profile by its unique slug.

**Params:** `slug` — string

### `GET /recruiters/:id` — **Public**

Get a recruiter profile by ID.

**Params:** `id` — UUID

### `PUT /recruiters/:id` — **Roles: RECRUITER, ADMIN**

Update a recruiter profile. All fields optional.

**Request Body:** Same as create, **except `userId` is not allowed**.
```json
{
  "slug?": "string",
  "title?": "string",
  "tagline?": "string",
  "bio?": "string",
  "photoUrl?": "string (URL)",
  "heroImageUrl?": "string (URL)",
  "yearsExperience?": "integer (>= 0)",
  "isLeadPartner?": "boolean",
  "partnerBadge?": "string",
  "publicEmail?": "string",
  "publicPhone?": "string",
  "location?": "string",
  "timezone?": "string",
  "rating?": "number",
  "visibility?": "DRAFT | PUBLISHED | ARCHIVED",
  "skillIds?": ["uuid"]
}
```

> When `skillIds` is provided, it **replaces** all current skill associations (set operation).

### `DELETE /recruiters/:id` — **Roles: ADMIN**

Delete a recruiter profile.

---

### Recruiter Tags

Tags categorize a recruiter (expertise, industry, focus role, etc.).

#### `POST /recruiters/:id/tags` — **Roles: RECRUITER, ADMIN**

Add a tag to a recruiter.

**Request Body:**
```json
{
  "type": "EXPERTISE | INDUSTRY | FOCUS_ROLE | LANGUAGE | CERTIFICATION | TOOL (required)",
  "value": "string (required)",
  "meta?": "string",
  "sortOrder?": "integer (>= 0)"
}
```

#### `DELETE /recruiters/tags/:tagId` — **Roles: RECRUITER, ADMIN**

Remove a tag by its ID.

---

### Recruiter Links

External links/contacts for a recruiter.

#### `POST /recruiters/:id/links` — **Roles: RECRUITER, ADMIN**

Add a link.

**Request Body:**
```json
{
  "type": "EMAIL | PHONE | WEBSITE | LINKEDIN | WHATSAPP | TELEGRAM | CALENDAR | OTHER (required)",
  "label?": "string",
  "url": "string (valid URL, required)",
  "sortOrder?": "integer (>= 0)"
}
```

#### `DELETE /recruiters/links/:linkId` — **Roles: RECRUITER, ADMIN**

Remove a link by its ID.

---

### Recruiter Active Searches

Current job searches a recruiter is running.

#### `POST /recruiters/:id/searches` — **Roles: RECRUITER, ADMIN**

Add an active search.

**Request Body:**
```json
{
  "title": "string (required)",
  "level?": "string",
  "industry?": "string",
  "location?": "string",
  "summary?": "string",
  "status?": "ACTIVE | ON_HOLD | CLOSED (default: ACTIVE)",
  "sortOrder?": "integer (>= 0)"
}
```

#### `PUT /recruiters/searches/:searchId` — **Roles: RECRUITER, ADMIN**

Update an active search. All fields from create body are accepted.

#### `DELETE /recruiters/searches/:searchId` — **Roles: RECRUITER, ADMIN**

Remove an active search.

---

### Recruiter Insights

Content pieces / media published by a recruiter.

#### `POST /recruiters/:id/insights` — **Roles: RECRUITER, ADMIN**

Add an insight.

**Request Body:**
```json
{
  "title": "string (required)",
  "description?": "string",
  "mediaUrl?": "string (URL)",
  "thumbnailUrl?": "string (URL)",
  "status?": "DRAFT | PUBLISHED | COMING_SOON | ARCHIVED (default: DRAFT)",
  "sortOrder?": "integer (>= 0)"
}
```

#### `PUT /recruiters/insights/:insightId` — **Roles: RECRUITER, ADMIN**

Update an insight. All fields from create body are accepted.

#### `DELETE /recruiters/insights/:insightId` — **Roles: RECRUITER, ADMIN**

Remove an insight.

---

## 4. Companies

### `POST /companies` — **Roles: COMPANY, ADMIN**

Create a company profile.

**Request Body:**
```json
{
  "userId": "uuid (required)",
  "name": "string (required)",
  "slug?": "string (unique)",
  "industry?": "string",
  "website?": "string (URL)",
  "logoUrl?": "string (URL)",
  "description?": "string",
  "size?": "string",
  "location?": "string",
  "skillIds?": ["uuid"]
}
```

### `GET /companies` — **Public**

List all companies with their skills and user included.

### `GET /companies/slug/:slug` — **Public**

Get a company by slug.

### `GET /companies/:id` — **Public**

Get a company by ID.

### `PUT /companies/:id` — **Roles: COMPANY, ADMIN**

Update a company. All fields optional (**except `userId`**).

**Request Body:**
```json
{
  "name?": "string",
  "slug?": "string",
  "industry?": "string",
  "website?": "string (URL)",
  "logoUrl?": "string (URL)",
  "description?": "string",
  "size?": "string",
  "location?": "string",
  "skillIds?": ["uuid"]
}
```

> When `skillIds` is provided, it **replaces** all current skill associations.

### `DELETE /companies/:id` — **Roles: ADMIN**

Delete a company.

---

## 5. Skills

### `POST /skills` — **Roles: ADMIN**

Create a skill.

**Request Body:**
```json
{
  "name": "string (unique, required)"
}
```

### `GET /skills` — **Public**

List all skills, ordered alphabetically by name.

**Response `200`:**
```json
[
  { "id": "uuid", "name": "TypeScript", "createdAt": "...", "updatedAt": "..." }
]
```

### `GET /skills/:id` — **Public**

Get a skill by ID with linked `recruiters` and `companies` included.

### `PUT /skills/:id` — **Roles: ADMIN**

Update a skill.

**Request Body:**
```json
{
  "name?": "string"
}
```

### `DELETE /skills/:id` — **Roles: ADMIN**

Delete a skill.

---

## 6. Recruit Requests

A recruit request is a form submission from a company to a recruiter.

### `POST /requests` — **Roles: COMPANY, ADMIN**

Create a new recruit request with form answers.

**Request Body:**
```json
{
  "formTemplateId": "uuid (required)",
  "companyId?": "uuid",
  "recruiterId?": "uuid",
  "answers": [
    {
      "formFieldId": "uuid (required)",
      "value": "string (required)"
    }
  ]
}
```

**Response:** Full request with `formTemplate`, `company`, `recruiter`, and `answers` (with `formField`) included.

### `GET /requests` — **Roles: RECRUITER, COMPANY, ADMIN**

List all requests.

**Query Params:**
| Param | Type | Description |
|-------|------|-------------|
| `status` | string | Filter by status: `PENDING`, `ACCEPTED`, `REJECTED` |

### `GET /requests/:id` — **Roles: RECRUITER, COMPANY, ADMIN**

Get a single request with all relations.

### `PUT /requests/:id/status` — **Roles: RECRUITER, ADMIN**

Update the status of a request.

**Request Body:**
```json
{
  "status": "PENDING | ACCEPTED | REJECTED (required)"
}
```

### `DELETE /requests/:id` — **Roles: ADMIN**

Delete a request (cascades to answers).

---

## 7. Form Templates

Form templates define the structure of recruit request forms.

### `POST /form-templates` — **Roles: ADMIN**

Create a form template, optionally with fields inline.

**Request Body:**
```json
{
  "name": "string (unique, required)",
  "isActive?": "boolean (default: true)",
  "fields?": [
    {
      "key": "string (required)",
      "label": "string (required)",
      "type?": "TEXT | TEXTAREA | EMAIL | PHONE | NUMBER | SELECT | MULTI_SELECT | CHECKBOX | DATE (default: TEXT)",
      "placeholder?": "string",
      "options?": "string (JSON-encoded for SELECT/MULTI_SELECT)",
      "isRequired?": "boolean (default: false)",
      "sortOrder?": "integer (>= 0)"
    }
  ]
}
```

### `GET /form-templates` — **Public**

List all form templates with their fields (ordered by `sortOrder`).

### `GET /form-templates/:id` — **Public**

Get a single form template with its fields.

### `PUT /form-templates/:id` — **Roles: ADMIN**

Update a form template's name or active status.

**Request Body:**
```json
{
  "name?": "string",
  "isActive?": "boolean"
}
```

### `DELETE /form-templates/:id` — **Roles: ADMIN**

Delete a form template (cascades to fields).

---

### Form Fields

#### `POST /form-templates/:id/fields` — **Roles: ADMIN**

Add a field to a form template.

**Request Body:**
```json
{
  "key": "string (required, unique per template)",
  "label": "string (required)",
  "type?": "TEXT | TEXTAREA | EMAIL | PHONE | NUMBER | SELECT | MULTI_SELECT | CHECKBOX | DATE",
  "placeholder?": "string",
  "options?": "string",
  "isRequired?": "boolean",
  "sortOrder?": "integer (>= 0)"
}
```

#### `PUT /form-templates/fields/:fieldId` — **Roles: ADMIN**

Update a form field.

#### `DELETE /form-templates/fields/:fieldId` — **Roles: ADMIN**

Remove a form field.

---

## 8. Enums & Constants

### Role
| Value | Description |
|-------|-------------|
| `COMPANY` | Company user — can manage own company, create requests |
| `RECRUITER` | Recruiter user — can manage own profile, respond to requests |
| `ADMIN` | Full access to all resources |

### ProfileVisibility
| Value |
|-------|
| `DRAFT` |
| `PUBLISHED` |
| `ARCHIVED` |

### RequestStatus
| Value |
|-------|
| `PENDING` |
| `ACCEPTED` |
| `REJECTED` |

### RecruiterTagType
| Value |
|-------|
| `EXPERTISE` |
| `INDUSTRY` |
| `FOCUS_ROLE` |
| `LANGUAGE` |
| `CERTIFICATION` |
| `TOOL` |

### LinkType
| Value |
|-------|
| `EMAIL` |
| `PHONE` |
| `WEBSITE` |
| `LINKEDIN` |
| `WHATSAPP` |
| `TELEGRAM` |
| `CALENDAR` |
| `OTHER` |

### ActiveSearchStatus
| Value |
|-------|
| `ACTIVE` |
| `ON_HOLD` |
| `CLOSED` |

### InsightStatus
| Value |
|-------|
| `DRAFT` |
| `PUBLISHED` |
| `COMING_SOON` |
| `ARCHIVED` |

### FormFieldType
| Value |
|-------|
| `TEXT` |
| `TEXTAREA` |
| `EMAIL` |
| `PHONE` |
| `NUMBER` |
| `SELECT` |
| `MULTI_SELECT` |
| `CHECKBOX` |
| `DATE` |

---

## 9. Error Handling

All errors follow NestJS standard format:

```json
{
  "statusCode": 404,
  "message": "Recruiter abc123 not found",
  "error": "Not Found"
}
```

### Common Status Codes

| Code | Meaning |
|------|---------|
| `400` | Validation error — invalid body, bad UUID, missing required field |
| `401` | Unauthorized — missing or invalid JWT |
| `403` | Forbidden — valid JWT but insufficient role |
| `404` | Not Found — resource doesn't exist |
| `409` | Conflict — duplicate unique field (email, name, slug) |

### Validation

- Request bodies are validated via `class-validator` with `whitelist: true` and `forbidNonWhitelisted: true`
- Unknown properties in the body are rejected with a `400` error
- UUID path parameters are validated via `ParseUUIDPipe`

---

## 10. Data Models

### User
```
id            UUID (PK)
email         string (unique)
password      string (hashed, never returned by /auth/me)
name          string
role          "COMPANY" | "RECRUITER" | "ADMIN"
createdAt     DateTime
updatedAt     DateTime
─── Relations ───
recruiterProfile  RecruiterProfile? (1:1)
company           Company? (1:1)
```

### RecruiterProfile
```
id                UUID (PK)
userId            UUID (unique FK → User)
slug              string? (unique)
title             string?
tagline           string?
bio               string?
photoUrl          string?
heroImageUrl      string?
yearsExperience   int?
isLeadPartner     boolean (default: false)
partnerBadge      string?
publicEmail       string?
publicPhone       string?
location          string?
timezone          string?
rating            float (default: 0)
visibility        "DRAFT" | "PUBLISHED" | "ARCHIVED" (default: DRAFT)
publishedAt       DateTime?
createdAt         DateTime
updatedAt         DateTime
─── Relations ───
skills            Skill[] (many-to-many)
tags              RecruiterTag[]
links             RecruiterLink[]
activeSearches    RecruiterActiveSearch[]
insights          RecruiterInsight[]
requests          RecruitRequest[]
```

### Company
```
id          UUID (PK)
userId      UUID (unique FK → User)
name        string
slug        string? (unique)
industry    string?
website     string?
logoUrl     string?
description string?
size        string?
location    string?
createdAt   DateTime
updatedAt   DateTime
─── Relations ───
skills      Skill[] (many-to-many)
requests    RecruitRequest[]
```

### Skill
```
id        UUID (PK)
name      string (unique)
createdAt DateTime
updatedAt DateTime
─── Relations ───
recruiters  RecruiterProfile[] (many-to-many)
companies   Company[] (many-to-many)
```

### RecruiterTag
```
id                  UUID (PK)
recruiterProfileId  UUID (FK)
type                RecruiterTagType
value               string
meta                string?
sortOrder           int (default: 0)
─── Unique ───
(recruiterProfileId, type, value)
```

### RecruiterLink
```
id                  UUID (PK)
recruiterProfileId  UUID (FK)
type                LinkType
label               string?
url                 string
sortOrder           int (default: 0)
─── Unique ───
(recruiterProfileId, type, url)
```

### RecruiterActiveSearch
```
id                  UUID (PK)
recruiterProfileId  UUID (FK)
title               string
level               string?
industry            string?
location            string?
summary             string?
status              "ACTIVE" | "ON_HOLD" | "CLOSED" (default: ACTIVE)
sortOrder           int (default: 0)
```

### RecruiterInsight
```
id                  UUID (PK)
recruiterProfileId  UUID (FK)
title               string
description         string?
mediaUrl            string?
thumbnailUrl        string?
status              "DRAFT" | "PUBLISHED" | "COMING_SOON" | "ARCHIVED" (default: DRAFT)
sortOrder           int (default: 0)
publishedAt         DateTime?
```

### FormTemplate
```
id        UUID (PK)
name      string (unique)
isActive  boolean (default: true)
createdAt DateTime
updatedAt DateTime
─── Relations ───
fields    FormField[]
requests  RecruitRequest[]
```

### FormField
```
id              UUID (PK)
formTemplateId  UUID (FK)
key             string
label           string
type            FormFieldType (default: TEXT)
placeholder     string?
options         string? (JSON for SELECT/MULTI_SELECT)
isRequired      boolean (default: false)
sortOrder       int (default: 0)
─── Unique ───
(formTemplateId, key)
```

### RecruitRequest
```
id              UUID (PK)
formTemplateId  UUID (FK → FormTemplate)
companyId       UUID? (FK → Company)
recruiterId     UUID? (FK → RecruiterProfile)
status          "PENDING" | "ACCEPTED" | "REJECTED" (default: PENDING)
createdAt       DateTime
updatedAt       DateTime
─── Relations ───
answers         RequestAnswer[]
```

### RequestAnswer
```
id                UUID (PK)
recruitRequestId  UUID (FK → RecruitRequest)
formFieldId       UUID (FK → FormField)
value             string
─── Unique ───
(recruitRequestId, formFieldId)
```

---

## Role-Based Access Summary

| Resource | Public | COMPANY | RECRUITER | ADMIN |
|----------|--------|---------|-----------|-------|
| **Auth** (register, login) | Yes | — | — | — |
| **Auth** (me) | — | Yes | Yes | Yes |
| **Users** | — | — | — | Full CRUD |
| **Recruiters** (read) | Yes | — | — | — |
| **Recruiters** (write) | — | — | Create, Update, Sub-resources | Full CRUD |
| **Companies** (read) | Yes | — | — | — |
| **Companies** (write) | — | Create, Update | — | Full CRUD + Delete |
| **Skills** (read) | Yes | — | — | — |
| **Skills** (write) | — | — | — | Full CRUD |
| **Requests** | — | Create, Read | Read, Update status | Full CRUD |
| **Form Templates** (read) | Yes | — | — | — |
| **Form Templates** (write) | — | — | — | Full CRUD |
