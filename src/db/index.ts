import { drizzle } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";
import env from "../utils/env";

const pgsql = neon(env.DATABASE_URL);

export const db = drizzle({ client: pgsql });
