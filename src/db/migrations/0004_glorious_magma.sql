ALTER TABLE "users" RENAME COLUMN "usernname" TO "username";--> statement-breakpoint
ALTER TABLE "users" DROP CONSTRAINT "users_usernname_unique";--> statement-breakpoint
DROP INDEX IF EXISTS "name_idx";--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "name_idx" ON "users" USING btree ("username");--> statement-breakpoint
ALTER TABLE "users" ADD CONSTRAINT "users_username_unique" UNIQUE("username");