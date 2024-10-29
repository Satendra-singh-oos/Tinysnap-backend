ALTER TABLE "tinyurls" ALTER COLUMN "url_status" SET DEFAULT 'ACTIVE';--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "role" SET DEFAULT 'USER';--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "login_type" SET DEFAULT 'EMAIL_PASSWORD';--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "account_status" SET DEFAULT 'UNVERIFIED';--> statement-breakpoint
ALTER TABLE "public"."users" ALTER COLUMN "account_status" SET DATA TYPE text;--> statement-breakpoint
DROP TYPE "public"."account_status";--> statement-breakpoint
CREATE TYPE "public"."account_status" AS ENUM('UNVERIFIED', 'VERIFIED', 'SUSPENDED', 'DEACTIVATED');--> statement-breakpoint
ALTER TABLE "public"."users" ALTER COLUMN "account_status" SET DATA TYPE "public"."account_status" USING "account_status"::"public"."account_status";--> statement-breakpoint
ALTER TABLE "public"."users" ALTER COLUMN "login_type" SET DATA TYPE text;--> statement-breakpoint
DROP TYPE "public"."login_type";--> statement-breakpoint
CREATE TYPE "public"."login_type" AS ENUM('EMAIL_PASSWORD', 'GOOGLE');--> statement-breakpoint
ALTER TABLE "public"."users" ALTER COLUMN "login_type" SET DATA TYPE "public"."login_type" USING "login_type"::"public"."login_type";--> statement-breakpoint
ALTER TABLE "public"."users" ALTER COLUMN "role" SET DATA TYPE text;--> statement-breakpoint
DROP TYPE "public"."role";--> statement-breakpoint
CREATE TYPE "public"."role" AS ENUM('ADMIN', 'USER', 'INFLUENCER');--> statement-breakpoint
ALTER TABLE "public"."users" ALTER COLUMN "role" SET DATA TYPE "public"."role" USING "role"::"public"."role";--> statement-breakpoint
ALTER TABLE "public"."tinyurls" ALTER COLUMN "url_status" SET DATA TYPE text;--> statement-breakpoint
DROP TYPE "public"."url_status";--> statement-breakpoint
CREATE TYPE "public"."url_status" AS ENUM('ACTIVE', 'EXPIRED');--> statement-breakpoint
ALTER TABLE "public"."tinyurls" ALTER COLUMN "url_status" SET DATA TYPE "public"."url_status" USING "url_status"::"public"."url_status";