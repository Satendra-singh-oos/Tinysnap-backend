import { pgTable, uniqueIndex, index, unique, serial, varchar, text, boolean, timestamp, foreignKey, integer, pgEnum } from "drizzle-orm/pg-core"
  import { sql } from "drizzle-orm"

export const accountStatus = pgEnum("account_status", ['unverified', 'verified', 'suspended', 'deactivated'])
export const loginType = pgEnum("login_type", ['email', 'google'])
export const role = pgEnum("role", ['admin', 'user', 'influencer'])
export const urlStatus = pgEnum("url_status", ['active', 'expired'])



export const users = pgTable("users", {
	id: serial().primaryKey().notNull(),
	name: varchar({ length: 100 }).notNull(),
	email: varchar({ length: 200 }).notNull(),
	avatarUrl: text("avatar_url"),
	password: varchar().notNull(),
	role: role().default('user').notNull(),
	loginType: loginType("login_type").notNull(),
	googleId: varchar("google_id", { length: 5000 }),
	isEmailVerified: boolean("is_email_verified").default(false),
	verificationOtp: varchar("verification_otp", { length: 5 }),
	otpExpiresAt: timestamp("otp_expires_at", { mode: 'string' }),
	accountStatus: accountStatus("account_status").default('unverified').notNull(),
	forgotPasswordToken: varchar("forgot_password_token"),
	forgotPasswordExpiry: timestamp("forgot_password_expiry", { mode: 'string' }),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
},
(table) => {
	return {
		emailIdx: uniqueIndex("email_idx").using("btree", table.email.asc().nullsLast()),
		googleIdx: uniqueIndex("google_idx").using("btree", table.googleId.asc().nullsLast()),
		nameIdx: index("name_idx").using("btree", table.name.asc().nullsLast()),
		usersNameUnique: unique("users_name_unique").on(table.name),
		usersEmailUnique: unique("users_email_unique").on(table.email),
		usersGoogleIdUnique: unique("users_google_id_unique").on(table.googleId),
	}
});

export const images = pgTable("images", {
	id: serial().primaryKey().notNull(),
	originalImageUrl: text("original_image_url"),
	optimizedImageUrl: text("optimized_image_url"),
	ownerUserId: integer("owner_user_id").notNull(),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
},
(table) => {
	return {
		imagesOwnerUserIdUsersIdFk: foreignKey({
			columns: [table.ownerUserId],
			foreignColumns: [users.id],
			name: "images_owner_user_id_users_id_fk"
		}).onDelete("cascade"),
	}
});

export const tinyurls = pgTable("tinyurls", {
	id: serial().primaryKey().notNull(),
	originalUrl: text("original_url").notNull(),
	shortName: varchar("short_name", { length: 100 }).notNull(),
	shortUrl: varchar("short_url", { length: 255 }).notNull(),
	ownerUserId: integer("owner_user_id").notNull(),
	urlValidity: timestamp("url_validity", { mode: 'string' }).notNull(),
	urlStatus: urlStatus("url_status").default('active').notNull(),
	isActive: boolean("is_active").default(true),
	totalVisits: integer("total_visits").default(0),
	createdAt: timestamp("created_at", { mode: 'string' }).defaultNow().notNull(),
	updatedAt: timestamp("updated_at", { mode: 'string' }).defaultNow().notNull(),
},
(table) => {
	return {
		userIdIdx: index("user_id_idx").using("btree", table.ownerUserId.asc().nullsLast()),
		tinyurlsOwnerUserIdUsersIdFk: foreignKey({
			columns: [table.ownerUserId],
			foreignColumns: [users.id],
			name: "tinyurls_owner_user_id_users_id_fk"
		}).onDelete("cascade"),
	}
});
