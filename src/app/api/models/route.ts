import { NextRequest, NextResponse } from "next/server";
import { MODELS_CATALOG } from "@/lib/catalog/models";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const category = searchParams.get("category");

  const models = category
    ? MODELS_CATALOG.filter((m) => m.category === category)
    : MODELS_CATALOG;

  return NextResponse.json({
    object: "list",
    router: "https://reelmux.com/api",
    total_count: 73,
    featured_count: models.length,
    data: models,
  });
}
