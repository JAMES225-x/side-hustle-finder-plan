import {
  boolean,
  index,
  integer,
  jsonb,
  pgEnum,
  pgTable,
  primaryKey,
  serial,
  text,
  timestamp,
  uniqueIndex,
} from "drizzle-orm/pg-core";

// --- Enums ---
export const difficultyEnum = pgEnum("difficulty", ["easy", "medium", "hard"]);
export const incomeLogTypeEnum = pgEnum("income_log_type", ["income", "expense"]);
export const scamRiskLevelEnum = pgEnum("scam_risk_level", ["low", "medium", "high"]);
export const scamReportStatusEnum = pgEnum("scam_report_status", [
  "pending",
  "reviewed",
  "rejected",
]);

// --- Core identities (Guest-mode friendly, upgradeable to a full account) ---
export const users = pgTable(
  "users",
  {
    id: text("id").primaryKey(), // stored in an HttpOnly cookie for guest-mode & sessions
    email: text("email"),
    passwordHash: text("password_hash"),
    name: text("name"),
    region: text("region"),
    city: text("city"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => ({
    emailUnique: uniqueIndex("users_email_unique").on(t.email),
  })
);

// --- Hustle database ---
export const hustles = pgTable(
  "hustles",
  {
    id: serial("id").primaryKey(),
    slug: text("slug").notNull(),
    nameTl: text("name_tl").notNull(),
    nameEn: text("name_en").notNull(),
    emoji: text("emoji").notNull().default("💼"),
    category: text("category").notNull(),
    descriptionTl: text("description_tl").notNull(),
    descriptionEn: text("description_en").notNull(),

    incomeMinPhp: integer("income_min_php").notNull(),
    incomeMaxPhp: integer("income_max_php").notNull(),
    incomePeriod: text("income_period").notNull().default("month"), // month/day/job

    capitalMinPhp: integer("capital_min_php").notNull().default(0),
    capitalMaxPhp: integer("capital_max_php").notNull().default(0),

    hoursMinPerWeek: integer("hours_min_per_week").notNull().default(1),
    hoursMaxPerWeek: integer("hours_max_per_week"),

    timeToFirstPesoDays: integer("time_to_first_peso_days").notNull().default(7),
    breakevenMonths: integer("breakeven_months"),

    // Unit economics (for Puhunan Calculator). Null for irregular-income hustles.
    unitLabel: text("unit_label"), // e.g. "order", "oras", "biyahe"
    avgPhpPerUnit: integer("avg_php_per_unit"),

    // Illustrative success story (clearly labeled in UI as illustrative)
    successStoryTl: text("success_story_tl"),

    difficulty: difficultyEnum("difficulty").notNull().default("easy"),

    regions: text("regions").array().notNull().default([]), // e.g. ["NCR","Nationwide","Rural-friendly"]
    requiresDevices: text("requires_devices").array().notNull().default([]), // e.g. ["phone","laptop","motor","car"]
    requiresInternet: text("requires_internet").notNull().default("any"), // data | prepaid_wifi | fiber | any

    skillsRequired: text("skills_required").array().notNull().default([]),
    legalRequirements: text("legal_requirements").array().notNull().default([]),

    prosTl: text("pros_tl").array().notNull().default([]),
    consTl: text("cons_tl").array().notNull().default([]),
    commonMistakesTl: text("common_mistakes_tl").array().notNull().default([]),

    // Lightweight structured guide content for the MVP
    steps: jsonb("steps").notNull().default([]),
    suppliers: jsonb("suppliers").notNull().default([]),

    legitimacyScore: integer("legitimacy_score").notNull().default(3), // 1..5
    isTrending: boolean("is_trending").notNull().default(false),

    verifiedAt: timestamp("verified_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => ({
    slugUnique: uniqueIndex("hustles_slug_unique").on(t.slug),
    categoryIdx: index("hustles_category_idx").on(t.category),
  })
);

// --- Quiz profiles ---
export const quizProfiles = pgTable("quiz_profiles", {
  id: serial("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),

  hoursPerWeek: text("hours_per_week").notNull(),
  capitalPhp: integer("capital_php").notNull(),
  region: text("region").notNull(),
  devices: text("devices").array().notNull().default([]),
  internet: text("internet").notNull(),
  skills: text("skills").array().notNull().default([]),
  urgency: text("urgency").notNull(),
  goal: text("goal").notNull(),

  completedAt: timestamp("completed_at", { withTimezone: true }).defaultNow().notNull(),
});

// --- Saved hustles ---
export const savedHustles = pgTable(
  "saved_hustles",
  {
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    hustleId: integer("hustle_id")
      .notNull()
      .references(() => hustles.id, { onDelete: "cascade" }),
    savedAt: timestamp("saved_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => ({
    pk: primaryKey({ columns: [t.userId, t.hustleId] }),
  })
);

// --- Income / expense tracker ---
export const incomeLogs = pgTable("income_logs", {
  id: serial("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  hustleId: integer("hustle_id").references(() => hustles.id, { onDelete: "set null" }),

  amountPhp: integer("amount_php").notNull(),
  type: incomeLogTypeEnum("type").notNull(),
  note: text("note"),
  loggedAt: timestamp("logged_at", { withTimezone: true }).defaultNow().notNull(),
});

// --- Scam Shield ---
export const scamRegistry = pgTable("scam_registry", {
  id: serial("id").primaryKey(),
  entityName: text("entity_name").notNull(),
  aliases: text("aliases").array().notNull().default([]),
  riskLevel: scamRiskLevelEnum("risk_level").notNull().default("medium"),
  source: text("source").notNull().default("community"),
  notes: text("notes"),
  lastVerifiedAt: timestamp("last_verified_at", { withTimezone: true }).defaultNow().notNull(),
});

export const scamReports = pgTable("scam_reports", {
  id: serial("id").primaryKey(),
  reporterId: text("reporter_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),

  entityName: text("entity_name").notNull(),
  platform: text("platform").notNull().default("unknown"),
  description: text("description").notNull(),
  evidenceUrl: text("evidence_url"),

  // The score at time of report (from Scam Shield v1)
  riskScore: integer("risk_score").notNull().default(0),
  status: scamReportStatusEnum("status").notNull().default("pending"),
  upvotes: integer("upvotes").notNull().default(0),

  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

// --- Legal starter kit ---
export const legalGuides = pgTable(
  "legal_guides",
  {
    id: serial("id").primaryKey(),
    slug: text("slug").notNull(),
    titleTl: text("title_tl").notNull(),
    titleEn: text("title_en").notNull(),
    bodyTl: text("body_tl").notNull(),
    bodyEn: text("body_en").notNull(),
    agency: text("agency").notNull().default(""),
    lastVerifiedAt: timestamp("last_verified_at", { withTimezone: true }).defaultNow().notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => ({
    slugUnique: uniqueIndex("legal_guides_slug_unique").on(t.slug),
  })
);
