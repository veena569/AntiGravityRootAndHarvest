import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const leads = await prisma.checkoutLead.findMany({
      orderBy: { updatedAt: "desc" },
    });
    return NextResponse.json({ success: true, leads });
  } catch (error: any) {
    console.error("[ADMIN_LEADS_GET_ERROR]", error);
    return NextResponse.json({ error: error.message || "Failed to fetch leads" }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id) return NextResponse.json({ error: "Lead ID required" }, { status: 400 });

    await prisma.checkoutLead.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("[ADMIN_LEADS_DELETE_ERROR]", error);
    return NextResponse.json({ error: error.message || "Failed to delete lead" }, { status: 500 });
  }
}
