import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/db";
import { JwtService } from "@/services/jwt.service";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const productId = searchParams.get("productId");

    // Fetch reviews
    const dbReviews = await prisma.review.findMany({
      where: productId ? { productId } : {},
      include: {
        user: {
          include: {
            addresses: {
              where: { isDefault: true },
              take: 1,
            },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    const formattedDbReviews = dbReviews.map((r) => {
      const city = r.user?.addresses[0]?.city || "Verified Reviewer";
      return {
        id: r.id,
        rating: r.rating,
        comment: r.comment,
        name: r.name,
        location: city,
        isVerified: r.isVerified,
        mediaUrls: r.mediaUrls,
        mediaTypes: r.mediaTypes,
        createdAt: r.createdAt.toISOString(),
      };
    });

    return NextResponse.json({ reviews: formattedDbReviews });
  } catch (error) {
    console.error("[REVIEWS_GET_FAILED]", error);
    return NextResponse.json({ error: "Failed to fetch reviews" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { rating, comment, mediaUrls, mediaTypes, productId, name } = body;

    const resolvedProductId = productId || "general";

    if (!rating || typeof rating !== "number" || rating < 1 || rating > 5) {
      return NextResponse.json({ error: "Please provide a valid rating between 1 and 5." }, { status: 400 });
    }

    if (!comment || typeof comment !== "string" || comment.trim().length < 5) {
      return NextResponse.json({ error: "Comment must be at least 5 characters long." }, { status: 400 });
    }

    // Check auth
    const token = cookies().get("rh_access_token")?.value;
    let userId: string | null = null;
    let reviewerName = name?.trim() || "Guest Reviewer";
    let isVerified = false;

    if (token) {
      try {
        const decoded = await JwtService.verifyToken(token);
        if (decoded && decoded.sub) {
          userId = decoded.sub;

          // Fetch user details
          const user = await prisma.user.findUnique({
            where: { id: userId },
          });

          if (user) {
            reviewerName = user.name || reviewerName;

            // Check if verified buyer (has paid or cod orders)
            const completedOrdersCount = await prisma.order.count({
              where: {
                userId,
                paymentStatus: {
                  in: ["paid", "cod"]
                },
              },
            });
            isVerified = completedOrdersCount > 0;
          }
        }
      } catch (authError) {
        console.warn("[REVIEWS_POST_AUTH_WARN] Failed to verify JWT token, fallback to guest review", authError);
      }
    }

    // Create the review
    const review = await prisma.review.create({
      data: {
        productId: resolvedProductId,
        userId,
        name: reviewerName,
        rating,
        comment: comment.trim(),
        isVerified,
        mediaUrls: mediaUrls || [],
        mediaTypes: mediaTypes || [],
      },
    });

    return NextResponse.json({ success: true, review });
  } catch (error) {
    console.error("[REVIEWS_POST_FAILED]", error);
    return NextResponse.json({ error: "Failed to submit review." }, { status: 500 });
  }
}
