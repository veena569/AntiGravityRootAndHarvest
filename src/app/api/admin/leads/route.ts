import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    let leads: any[] = [];
    let lastError: any = null;

    for (let attempt = 0; attempt < 3; attempt++) {
      try {
        leads = await prisma.checkoutLead.findMany({
          orderBy: { updatedAt: "desc" },
        });
        lastError = null;
        break;
      } catch (err: any) {
        lastError = err;
        await new Promise((res) => setTimeout(res, 1000));
      }
    }

    if (lastError && leads.length === 0) {
      console.error("[ADMIN_LEADS_GET_ERROR]", lastError);
      return NextResponse.json({ success: true, leads: [] });
    }

    return NextResponse.json({ success: true, leads });
  } catch (error: any) {
    console.error("[ADMIN_LEADS_GET_ERROR]", error);
    return NextResponse.json({ success: true, leads: [] });
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
