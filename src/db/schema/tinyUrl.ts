import {
  pgTable,
  timestamp,
  varchar,
  boolean,
  text,
  pgEnum,
  integer,
  index,
  uuid,
} from "drizzle-orm/pg-core";
import usersTable from "./user";

// Enums
export const urlStatusEnum = pgEnum("url_status", ["ACTIVE", "EXPIRED"]);

// tinyUrl Table
const tinyUrlTable = pgTable(
  "tinyurls",
  {
    id: uuid("id").defaultRandom().primaryKey(),

    // URL fields
    originalUrl: text("original_url").notNull(),
    shortName: varchar("short_name", { length: 100 }).notNull(),
    shortUrl: varchar("short_url", { length: 255 }).notNull(),

    // User reference with serial id
    userId: uuid("owner_user_id")
      .notNull()
      .references(() => usersTable.id, { onDelete: "cascade" }),

    // Validity and Status
    urlValidity: timestamp("url_validity", { mode: "date" }).notNull(), // Made notNull since it's a key feature
    status: urlStatusEnum("url_status").notNull().default("ACTIVE"),
    isActive: boolean("is_active").default(true), // Quick check for validity

    // Analytics
    totalVisits: integer("total_visits").default(0), //total url vist

    // Timestamps
    createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { mode: "date" }).defaultNow().notNull(),
  },
  (table) => {
    return {
      usreIdIdx: index("user_id_idx").on(table.userId),
    };
  }
);

export default tinyUrlTable;
