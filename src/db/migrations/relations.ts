import { relations } from "drizzle-orm/relations";
import { users, images, tinyurls } from "./schema";

export const imagesRelations = relations(images, ({one}) => ({
	user: one(users, {
		fields: [images.ownerUserId],
		references: [users.id]
	}),
}));

export const usersRelations = relations(users, ({many}) => ({
	images: many(images),
	tinyurls: many(tinyurls),
}));

export const tinyurlsRelations = relations(tinyurls, ({one}) => ({
	user: one(users, {
		fields: [tinyurls.ownerUserId],
		references: [users.id]
	}),
}));