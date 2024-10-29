ALTER TABLE "users" RENAME COLUMN "verification_otp" TO "verify_token";--> statement-breakpoint
ALTER TABLE "users" RENAME COLUMN "otp_expires_at" TO "verify_token_expiry";--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "verify_token" SET DATA TYPE varchar;