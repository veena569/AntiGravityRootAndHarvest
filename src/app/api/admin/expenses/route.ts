import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { headers, cookies } from "next/headers";
import { JwtService } from "@/services/jwt.service";
import { authConfig } from "@/config/auth";

export const dynamic = "force-dynamic";

async function checkAdminAuth() {
  const headerRole = headers().get("x-user-role");
  if (headerRole === "ADMIN" || headerRole === "SUPER_ADMIN") return true;

  const token = cookies().get(authConfig.cookies.accessToken)?.value;
  if (token) {
    const payload = await JwtService.verifyToken(token);
    if (payload && (payload.role === "ADMIN" || payload.role === "SUPER_ADMIN")) {
      return true;
    }
  }
  return false;
}

export async function GET() {
  try {
    const isAuthorized = await checkAdminAuth();
    if (!isAuthorized) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const expenses = await prisma.businessExpense.findMany({
      orderBy: { date: "desc" },
    });

    return NextResponse.json({ expenses });
  } catch (error: any) {
    console.error("[ADMIN_EXPENSES_GET_FAILED]", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch expenses" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const isAuthorized = await checkAdminAuth();
    if (!isAuthorized) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await req.json();

    // Support bulk save / sync
    if (Array.isArray(body.expenses)) {
      const incomingList = body.expenses;

      // Execute in transaction
      const result = await prisma.$transaction(async (tx) => {
        const existingExpenses = await tx.businessExpense.findMany();
        const incomingIds = new Set(
          incomingList.map((e: any) => e.id).filter(Boolean)
        );

        // Delete records that were removed in the UI (only if incoming array isn't empty)
        const toDelete = existingExpenses.filter((e) => !incomingIds.has(e.id));
        if (toDelete.length > 0) {
          await tx.businessExpense.deleteMany({
            where: { id: { in: toDelete.map((e) => e.id) } },
          });
        }

        // Upsert/create remaining
        for (const item of incomingList) {
          const expenseData = {
            date: String(item.date || new Date().toISOString().split("T")[0]),
            category: String(item.category || "General"),
            item: String(item.item || "Expense Item"),
            quantity: String(item.quantity || "1"),
            unitCost: Number(item.unitCost) || 0,
            shippingCost: Number(item.shippingCost) || 0,
            amount: Number(item.amount) || 0,
            notes: item.notes ? String(item.notes) : "",
          };

          const isExisting = item.id && existingExpenses.some((e) => e.id === item.id);

          if (isExisting) {
            await tx.businessExpense.update({
              where: { id: item.id },
              data: expenseData,
            });
          } else {
            await tx.businessExpense.create({
              data: expenseData,
            });
          }
        }

        return await tx.businessExpense.findMany({
          orderBy: { date: "desc" },
        });
      });

      return NextResponse.json({ success: true, expenses: result });
    }

    // Support single item create
    if (body.expense) {
      const item = body.expense;
      const created = await prisma.businessExpense.create({
        data: {
          date: String(item.date || new Date().toISOString().split("T")[0]),
          category: String(item.category || "General"),
          item: String(item.item || "Expense Item"),
          quantity: String(item.quantity || "1"),
          unitCost: Number(item.unitCost) || 0,
          shippingCost: Number(item.shippingCost) || 0,
          amount: Number(item.amount) || 0,
          notes: item.notes ? String(item.notes) : "",
        },
      });

      return NextResponse.json({ success: true, expense: created });
    }

    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  } catch (error: any) {
    console.error("[ADMIN_EXPENSES_POST_FAILED]", error);
    return NextResponse.json(
      { error: error.message || "Failed to save expenses" },
      { status: 500 }
    );
  }
}

export async function DELETE(req: Request) {
  try {
    const isAuthorized = await checkAdminAuth();
    if (!isAuthorized) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Expense ID required" }, { status: 400 });
    }

    await prisma.businessExpense.delete({
      where: { id },
    });

    return NextResponse.json({ success: true, message: "Expense deleted successfully" });
  } catch (error: any) {
    console.error("[ADMIN_EXPENSES_DELETE_FAILED]", error);
    return NextResponse.json(
      { error: error.message || "Failed to delete expense" },
      { status: 500 }
    );
  }
}
