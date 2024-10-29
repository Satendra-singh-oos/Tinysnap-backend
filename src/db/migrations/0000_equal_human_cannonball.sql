CREATE TYPE "public"."account_status" AS ENUM('unverified', 'verified', 'suspended', 'deactivated');--> statement-breakpoint
CREATE TYPE "public"."login_type" AS ENUM('email', 'google');--> statement-breakpoint
CREATE TYPE "public"."role" AS ENUM('admin', 'user', 'influencer');--> statement-breakpoint
CREATE TYPE "public"."url_status" AS ENUM('active', 'expired');--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "images" (
	"id" serial PRIMARY KEY NOT NULL,
	"original_image_url" text,
	"optimized_image_url" text,
	"owner_user_id" integer NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "tinyurls" (
	"id" serial PRIMARY KEY NOT NULL,
	"original_url" text NOT NULL,
	"short_name" varchar(100) NOT NULL,
	"short_url" varchar(255) NOT NULL,
	"owner_user_id" integer NOT NULL,
	"url_validity" timestamp NOT NULL,
	"url_status" "url_status" DEFAULT 'active' NOT NULL,
	"is_active" boolean DEFAULT true,
	"total_visits" integer DEFAULT 0,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "users" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(100) NOT NULL,
	"email" varchar(200) NOT NULL,
	"avatar_url" text,
	"password" varchar NOT NULL,
	"role" "role" DEFAULT 'user' NOT NULL,
	"login_type" "login_type" DEFAULT 'email' NOT NULL,
	"google_id" varchar(5000),
	"is_email_verified" boolean DEFAULT false,
	"verification_otp" varchar(5),
	"otp_expires_at" timestamp,
	"account_status" "account_status" DEFAULT 'unverified' NOT NULL,
	"forgot_password_token" varchar,
	"forgot_password_expiry" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "users_name_unique" UNIQUE("name"),
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
CREATE INDEX IF NOT EXISTS "name_idx" ON "users" USING btree ("name");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "email_idx" ON "users" USING btree ("email");--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "google_idx" ON "users" USING btree ("google_id");