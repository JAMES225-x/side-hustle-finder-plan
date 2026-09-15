CREATE TYPE "public"."difficulty" AS ENUM('easy', 'medium', 'hard');--> statement-breakpoint
CREATE TYPE "public"."income_log_type" AS ENUM('income', 'expense');--> statement-breakpoint
CREATE TYPE "public"."scam_report_status" AS ENUM('pending', 'reviewed', 'rejected');--> statement-breakpoint
CREATE TYPE "public"."scam_risk_level" AS ENUM('low', 'medium', 'high');--> statement-breakpoint
CREATE TABLE "hustles" (
	"id" serial PRIMARY KEY NOT NULL,
	"slug" text NOT NULL,
	"name_tl" text NOT NULL,
	"name_en" text NOT NULL,
	"emoji" text DEFAULT '💼' NOT NULL,
	"category" text NOT NULL,
	"description_tl" text NOT NULL,
	"description_en" text NOT NULL,
	"income_min_php" integer NOT NULL,
	"income_max_php" integer NOT NULL,
	"income_period" text DEFAULT 'month' NOT NULL,
	"capital_min_php" integer DEFAULT 0 NOT NULL,
	"capital_max_php" integer DEFAULT 0 NOT NULL,
	"hours_min_per_week" integer DEFAULT 1 NOT NULL,
	"hours_max_per_week" integer,
	"time_to_first_peso_days" integer DEFAULT 7 NOT NULL,
	"breakeven_months" integer,
	"unit_label" text,
	"avg_php_per_unit" integer,
	"success_story_tl" text,
	"difficulty" "difficulty" DEFAULT 'easy' NOT NULL,
	"regions" text[] DEFAULT '{}' NOT NULL,
	"requires_devices" text[] DEFAULT '{}' NOT NULL,
	"requires_internet" text DEFAULT 'any' NOT NULL,
	"skills_required" text[] DEFAULT '{}' NOT NULL,
	"legal_requirements" text[] DEFAULT '{}' NOT NULL,
	"pros_tl" text[] DEFAULT '{}' NOT NULL,
	"cons_tl" text[] DEFAULT '{}' NOT NULL,
	"common_mistakes_tl" text[] DEFAULT '{}' NOT NULL,
	"steps" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"suppliers" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"legitimacy_score" integer DEFAULT 3 NOT NULL,
	"is_trending" boolean DEFAULT false NOT NULL,
	"verified_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "income_logs" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"hustle_id" integer,
	"amount_php" integer NOT NULL,
	"type" "income_log_type" NOT NULL,
	"note" text,
	"logged_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "legal_guides" (
	"id" serial PRIMARY KEY NOT NULL,
	"slug" text NOT NULL,
	"title_tl" text NOT NULL,
	"title_en" text NOT NULL,
	"body_tl" text NOT NULL,
	"body_en" text NOT NULL,
	"agency" text DEFAULT '' NOT NULL,
	"last_verified_at" timestamp with time zone DEFAULT now() NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "quiz_profiles" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"hours_per_week" text NOT NULL,
	"capital_php" integer NOT NULL,
	"region" text NOT NULL,
	"devices" text[] DEFAULT '{}' NOT NULL,
	"internet" text NOT NULL,
	"skills" text[] DEFAULT '{}' NOT NULL,
	"urgency" text NOT NULL,
	"goal" text NOT NULL,
	"completed_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "saved_hustles" (
	"user_id" text NOT NULL,
	"hustle_id" integer NOT NULL,
	"saved_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "saved_hustles_user_id_hustle_id_pk" PRIMARY KEY("user_id","hustle_id")
);
--> statement-breakpoint
CREATE TABLE "scam_registry" (
	"id" serial PRIMARY KEY NOT NULL,
	"entity_name" text NOT NULL,
	"aliases" text[] DEFAULT '{}' NOT NULL,
	"risk_level" "scam_risk_level" DEFAULT 'medium' NOT NULL,
	"source" text DEFAULT 'community' NOT NULL,
	"notes" text,
	"last_verified_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "scam_reports" (
	"id" serial PRIMARY KEY NOT NULL,
	"reporter_id" text NOT NULL,
	"entity_name" text NOT NULL,
	"platform" text DEFAULT 'unknown' NOT NULL,
	"description" text NOT NULL,
	"evidence_url" text,
	"risk_score" integer DEFAULT 0 NOT NULL,
	"status" "scam_report_status" DEFAULT 'pending' NOT NULL,
	"upvotes" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" text PRIMARY KEY NOT NULL,
	"email" text,
	"password_hash" text,
	"name" text,
	"region" text,
	"city" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "income_logs" ADD CONSTRAINT "income_logs_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "income_logs" ADD CONSTRAINT "income_logs_hustle_id_hustles_id_fk" FOREIGN KEY ("hustle_id") REFERENCES "public"."hustles"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "quiz_profiles" ADD CONSTRAINT "quiz_profiles_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "saved_hustles" ADD CONSTRAINT "saved_hustles_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "saved_hustles" ADD CONSTRAINT "saved_hustles_hustle_id_hustles_id_fk" FOREIGN KEY ("hustle_id") REFERENCES "public"."hustles"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "scam_reports" ADD CONSTRAINT "scam_reports_reporter_id_users_id_fk" FOREIGN KEY ("reporter_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "hustles_slug_unique" ON "hustles" USING btree ("slug");--> statement-breakpoint
CREATE INDEX "hustles_category_idx" ON "hustles" USING btree ("category");--> statement-breakpoint
CREATE UNIQUE INDEX "legal_guides_slug_unique" ON "legal_guides" USING btree ("slug");--> statement-breakpoint
CREATE UNIQUE INDEX "users_email_unique" ON "users" USING btree ("email");