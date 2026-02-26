// src/lib/db.ts
import { neon } from '@neondatabase/serverless';

const DATABASE_URL = import.meta.env.VITE_URL
const sql = neon(DATABASE_URL);

export async function query<T>(
  strings: TemplateStringsArray,
  ...values: any[]
): Promise<T[]> {
  try {
    // @ts-ignore - The neon client handles this correctly
    const result = await sql(strings, ...values);
    return result as T[];
  } catch (error) {
    console.error('Database error:', error);
    throw error;
  }
}

