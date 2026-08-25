import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { headers } from "next/headers";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const userRole = headers().get("x-user-role");
    if (userRole !== "ADMIN" && userRole !== "SUPER_ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Fetch total hits count
    const totalHits = await prisma.siteHit.count();

    // Fetch unique IP count (visitor estimation)
    const uniqueVisitorsResult = await prisma.siteHit.groupBy({
      by: ["ipAddress"],
      _count: {
        _all: true,
      },
    });
    const uniqueVisitors = uniqueVisitorsResult.length;

    // Fetch top visited paths
    const topPaths = await prisma.siteHit.groupBy({
      by: ["path"],
      _count: {
        id: true,
      },
      orderBy: {
        _count: {
          id: "desc",
        },
      },
      take: 10,
    });

    // Recent 50 hits
    const recentHits = await prisma.siteHit.findMany({
      orderBy: {
        createdAt: "desc",
      },
      take: 50,
    });

    // Calculate daily hits breakdown for last 7 days
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const rawHitsLast7Days = await prisma.siteHit.findMany({
      where: {
        createdAt: {
          gte: sevenDaysAgo,
        },
      },
      select: {
        createdAt: true,
        path: true,
      },
    });

    const dailyHitsMap: Record<string, number> = {};
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateKey = d.toISOString().split("T")[0];
      dailyHitsMap[dateKey] = 0;
    }

    rawHitsLast7Days.forEach((hit) => {
      const dateKey = hit.createdAt.toISOString().split("T")[0];
      if (dailyHitsMap[dateKey] !== undefined) {
        dailyHitsMap[dateKey] += 1;
      }
    });

    const dailyTrend = Object.entries(dailyHitsMap).map(([date, hits]) => ({
      date,
      hits,
    }));

    return NextResponse.json({
      totalHits,
      uniqueVisitors,
      topPaths: topPaths.map((p) => ({ path: p.path, count: p._count.id })),
      dailyTrend,
      recentHits,
    });
  } catch (error) {
    console.error("[ADMIN_ANALYTICS_GET]", error);
    return NextResponse.json({ error: "Failed to fetch analytics" }, { status: 500 });
  }
}
