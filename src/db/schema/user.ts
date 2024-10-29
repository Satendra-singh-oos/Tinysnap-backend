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
  uuid,
} from "drizzle-orm/pg-core";

// Enums
export const roleEnum = pgEnum("role", ["ADMIN", "USER", "INFLUENCER"]);
export const loginTypeEnum = pgEnum("login_type", ["EMAIL_PASSWORD", "GOOGLE"]);
export const accountStatusEnum = pgEnum("account_status", [
  "UNVERIFIED",
  "VERIFIED",
  "SUSPENDED",
  "DEACTIVATED",
]);

//users table
const usersTable = pgTable(
  "users",
  {
    id: uuid("id").defaultRandom().primaryKey(),

    // Profile Fields
    username: varchar("username", { length: 20 }).notNull().unique(),
    email: varchar("email").notNull().unique(),
    avatarUrl: text("avatar_url"),
    password: varchar("password").notNull(),

    // user role;
    role: roleEnum().notNull().default("USER"),

    // Authentication Related
    loginType: loginTypeEnum("login_type").notNull().default("EMAIL_PASSWORD"),
    googleId: varchar("google_id", { length: 5000 }).unique(),

    // Verification fields
    isEmailVerified: boolean("is_email_verified").default(false),
    verifyToken: varchar("verify_token"),
    verifyTokenExpiry: timestamp("verify_token_expiry", { mode: "date" }),

    // Security
    accountStatus: accountStatusEnum("account_status")
      .notNull()
      .default("UNVERIFIED"),

    //forget passoword
    forgotPasswordToken: varchar("forgot_password_token"),
    forgotPasswordExpiry: timestamp("forgot_password_expiry", { mode: "date" }),

    // Timestamps
    createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { mode: "date" }).defaultNow().notNull(),
  },
  (table) => {
    return {
      nameIdx: index("name_idx").on(table.username),
      emailIdx: uniqueIndex("email_idx").on(table.email),
      googleIdx: uniqueIndex("google_idx").on(table.googleId),
    };
  }
);

export default usersTable;
