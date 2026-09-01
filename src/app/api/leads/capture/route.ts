import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, phone, email, stage, cartItems, cartTotal } = body;

    const cleanPhone = phone ? String(phone).replace(/[^0-9]/g, "") : null;
    const cleanEmail = email ? String(email).trim().toLowerCase() : null;

    if (!cleanPhone && !cleanEmail) {
      return NextResponse.json({ error: "Phone or Email required" }, { status: 400 });
    }

    // Find existing lead by phone or email
    let existingLead = null;
    if (cleanPhone && cleanPhone.length >= 10) {
      existingLead = await prisma.checkoutLead.findFirst({
        where: { phone: cleanPhone },
        orderBy: { createdAt: "desc" },
      });
    } else if (cleanEmail) {
      existingLead = await prisma.checkoutLead.findFirst({
        where: { email: cleanEmail },
        orderBy: { createdAt: "desc" },
      });
    }

    let lead;
    if (existingLead) {
      lead = await prisma.checkoutLead.update({
        where: { id: existingLead.id },
        data: {
          name: name || existingLead.name,
          phone: cleanPhone || existingLead.phone,
          email: cleanEmail || existingLead.email,
          stage: stage || existingLead.stage,
          cartItems: cartItems ? cartItems : existingLead.cartItems,
          cartTotal: typeof cartTotal === "number" ? cartTotal : existingLead.cartTotal,
          abandoned: true,
        },
      });
    } else {
      lead = await prisma.checkoutLead.create({
        data: {
          name: name || null,
          phone: cleanPhone || null,
          email: cleanEmail || null,
          stage: stage || "checkout_shipping",
          cartItems: cartItems || [],
          cartTotal: typeof cartTotal === "number" ? cartTotal : 0,
          abandoned: true,
        },
      });
    }

    return NextResponse.json({ success: true, leadId: lead.id });
  } catch (error: any) {
    console.error("[LEAD_CAPTURE_ERROR]", error);
    return NextResponse.json({ error: error.message || "Failed to capture lead" }, { status: 500 });
  }
}
