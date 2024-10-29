CREATE TYPE "public"."account_status" AS ENUM('UNVERIFIED', 'VERIFIED', 'SUSPENDED', 'DEACTIVATED');--> statement-breakpoint
CREATE TYPE "public"."login_type" AS ENUM('EMAIL_PASSWORD', 'GOOGLE');--> statement-breakpoint
CREATE TYPE "public"."role" AS ENUM('ADMIN', 'USER', 'INFLUENCER');--> statement-breakpoint
CREATE TYPE "public"."url_status" AS ENUM('ACTIVE', 'EXPIRED');--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "images" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"original_image_url" text,
	"optimized_image_url" text,
	"owner_user_id" uuid NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "tinyurls" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"original_url" text NOT NULL,
	"short_name" varchar(100) NOT NULL,
	"short_url" varchar(255) NOT NULL,
	"owner_user_id" uuid NOT NULL,
	"url_validity" timestamp NOT NULL,
	"url_status" "url_status" DEFAULT 'ACTIVE' NOT NULL,
	"is_active" boolean DEFAULT true,
	"total_visits" integer DEFAULT 0,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"username" varchar(20) NOT NULL,
	"email" varchar NOT NULL,
	"avatar_url" text,
	"password" varchar NOT NULL,
	"role" "role" DEFAULT 'USER' NOT NULL,
	"login_type" "login_type" DEFAULT 'EMAIL_PASSWORD' NOT NULL,
	"google_id" varchar(5000),
	"is_email_verified" boolean DEFAULT false,
	"verify_token" varchar,
	"verify_token_expiry" timestamp,
	"account_status" "account_status" DEFAULT 'UNVERIFIED' NOT NULL,
	"forgot_password_token" varchar,
	"forgot_password_expiry" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "users_username_unique" UNIQUE("username"),
	CONSTRAINT "users_email_unique" UNIQUE("email"),
	CONSTRAINT "users_google_id_unique" UNIQUE("google_id")
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "images" ADD CONSTRAINT "images_owner_user_id_users_id_fk" FOREIGN KEY ("owner_user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "tinyurls" ADD CONSTRAINT "tinyurls_owner_user_id_users_id_fk" FOREIGN KEY ("owner_user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "user_id_idx" ON "tinyurls" USING btree ("owner_user_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "name_idx" ON "users" USING btree ("username");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "email_idx" ON "users" USING btree ("email");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "google_idx" ON "users" USING btree ("google_id");