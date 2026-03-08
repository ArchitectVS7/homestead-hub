import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { CreateStorageItemSchema } from "@/lib/validations";
import { ZodError } from "zod";

// Coerce date strings in a parsed body to Date objects before Zod validation
function coerceDates(body: Record<string, unknown>): Record<string, unknown> {
  const dateFields = ["purchaseDate", "expirationDate"];
  const result = { ...body };
  for (const field of dateFields) {
    if (typeof result[field] === "string") {
      result[field] = new Date(result[field] as string);
    }
  }
  return result;
}

/**
 * GET /api/storage
 *
 * Returns all storage items ordered by expiration date (soonest first,
 * null-expiry items at the end). Accepts an optional `category` query
 * parameter to filter by category.
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category");

    const items = await db.storageItem.findMany({
      where: category ? { category } : undefined,
      orderBy: [
        { expirationDate: "asc" },
        { name: "asc" },
      ],
    });

    return NextResponse.json(items);
  } catch (error) {
    console.error("[GET /api/storage]", error);
    return NextResponse.json(
      { error: "Failed to fetch storage items" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/storage
 *
 * Creates a new storage item. Expects a JSON body matching CreateStorageItemSchema.
 * Returns the created item with HTTP 201.
 */
export async function POST(request: NextRequest) {
  try {
    const raw = await request.json();
    const validated = CreateStorageItemSchema.parse(coerceDates(raw));

    const item = await db.storageItem.create({ data: validated });

    return NextResponse.json(item, { status: 201 });
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        { error: "Validation failed", details: error.flatten().fieldErrors },
        { status: 422 }
      );
    }
    console.error("[POST /api/storage]", error);
    return NextResponse.json(
      { error: "Failed to create storage item" },
      { status: 500 }
    );
  }
}
