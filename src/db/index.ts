import { drizzle } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";
import env from "../utils/env";
import * as schema from "./schema";

const pgsql = neon(env.DATABASE_URL);

export const db = drizzle(pgsql, { schema: schema });

export const connectDb = async () => {
  try {
    // Execute a simple query
    // const result = await db.execute("SELECT 1");
    // console.log(result);
    console.log(" 🍀 Database connected successfully");
    return true;
  } catch (error) {
    console.error("Database connection failed:", error);
    process.exit(1);
  }
};
