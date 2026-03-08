import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { UpdateStorageItemSchema } from "@/lib/validations";
import { ZodError } from "zod";

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

type Params = { params: Promise<{ id: string }> };

/**
 * GET /api/storage/[id]
 *
 * Returns a single storage item by ID. Returns 404 if not found.
 */
export async function GET(_request: NextRequest, { params }: Params) {
  const { id } = await params;
  try {
    const item = await db.storageItem.findUnique({ where: { id } });
    if (!item) {
      return NextResponse.json({ error: "Item not found" }, { status: 404 });
    }
    return NextResponse.json(item);
  } catch (error) {
    console.error(`[GET /api/storage/${id}]`, error);
    return NextResponse.json(
      { error: "Failed to fetch storage item" },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/storage/[id]
 *
 * Updates a storage item (partial update). Returns the updated item.
 * Returns 404 if the item does not exist.
 */
export async function PUT(request: NextRequest, { params }: Params) {
  const { id } = await params;
  try {
    // Confirm the item exists before updating
    const existing = await db.storageItem.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: "Item not found" }, { status: 404 });
    }

    const raw = await request.json();
    const validated = UpdateStorageItemSchema.parse(coerceDates(raw));

    const updated = await db.storageItem.update({
      where: { id },
      data: validated,
    });

    return NextResponse.json(updated);
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        { error: "Validation failed", details: error.flatten().fieldErrors },
        { status: 422 }
      );
    }
    console.error(`[PUT /api/storage/${id}]`, error);
    return NextResponse.json(
      { error: "Failed to update storage item" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/storage/[id]
 *
 * Deletes a storage item. Returns 204 on success, 404 if not found.
 */
export async function DELETE(_request: NextRequest, { params }: Params) {
  const { id } = await params;
  try {
    const existing = await db.storageItem.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: "Item not found" }, { status: 404 });
    }

    await db.storageItem.delete({ where: { id } });
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error(`[DELETE /api/storage/${id}]`, error);
    return NextResponse.json(
      { error: "Failed to delete storage item" },
      { status: 500 }
    );
  }
}
