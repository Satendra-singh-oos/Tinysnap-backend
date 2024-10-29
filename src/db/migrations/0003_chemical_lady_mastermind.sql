ALTER TABLE "users" RENAME COLUMN "name" TO "usernname";--> statement-breakpoint
ALTER TABLE "users" DROP CONSTRAINT "users_name_unique";--> statement-breakpoint
DROP INDEX IF EXISTS "name_idx";--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "name_idx" ON "users" USING btree ("usernname");--> statement-breakpoint
ALTER TABLE "users" ADD CONSTRAINT "users_usernname_unique" UNIQUE("usernname");