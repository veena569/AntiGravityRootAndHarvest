import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { order_id, payment_id, status } = body;

    // Verify payment with Cashfree in a real implementation
    
    // Update the database
    const updatedOrder = await prisma.order.update({
      where: { id: order_id },
      data: {
        paymentStatus: status,
        paymentId: payment_id,
      },
    });

    return NextResponse.json({ success: true, order: updatedOrder });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to confirm order" }, { status: 500 });
  }
}
