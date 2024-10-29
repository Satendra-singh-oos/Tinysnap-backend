import {
  pgTable,
  serial,
  timestamp,
  text,
  integer,
  uuid,
} from "drizzle-orm/pg-core";
import usersTable from "./user";

const imageTable = pgTable("images", {
  id: uuid("id").defaultRandom().primaryKey(),

  // images url
  orignalUrl: text("original_image_url"),
  optimizedUrl: text("optimized_image_url"),

  // User reference with serial id
  userId: integer("owner_user_id")
    .notNull()
    .references(() => usersTable.id, { onDelete: "cascade" }),

  // Timestamps
  createdAt: timestamp("created_at", { mode: "date" }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { mode: "date" }).defaultNow().notNull(),
});

export default imageTable;
