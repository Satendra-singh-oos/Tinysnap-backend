import {
  pgTable,
  serial,
  timestamp,
  varchar,
  boolean,
  text,
  pgEnum,
  index,
  uniqueIndex,
} from "drizzle-orm/pg-core";

// Enums
export const roleEnum = pgEnum("role", ["admin", "user", "influencer"]);
export const authTypeEnum = pgEnum("auth_type", ["email", "google"]);
export const accountStatusEnum = pgEnum("account_status", [
  "unverified",
  "verified",
  "suspended",
  "deactivated",
]);

//users table
const usersTable = pgTable(
  "users",
  {
    id: serial("id").primaryKey(),

    // Profile Fields
    name: varchar("name", { length: 100 }).notNull().unique(),
    email: varchar("email", { length: 200 }).notNull().unique(),
    avatarUrl: text("avatar_url"),
    password: varchar({ length: 20 }),

    // user role;
    role: roleEnum().notNull().default("user"),

    // Authentication Related
    authType: authTypeEnum("auth_type").notNull().default("email"),
    googleId: varchar("google_id", { length: 5000 }).unique(),

    // Verification fields
    isEmailVerified: boolean("is_email_verified").default(false),
    verificationOtp: varchar("verification_otp", { length: 5 }),
    otpExpiresAt: timestamp("otp_expires_at", { mode: "date" }),

    // Security
    accountStatus: accountStatusEnum("account_status")
      .notNull()
      .default("unverified"),

    // Timestamps
    createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { mode: "date" }).defaultNow().notNull(),
  },
  (table) => {
    return {
      nameIdx: index("name_idx").on(table.name),
      emailIdx: uniqueIndex("email_idx").on(table.email),
      googleIdx: uniqueIndex("google_idx").on(table.googleId),
    };
  }
);

export default usersTable;
