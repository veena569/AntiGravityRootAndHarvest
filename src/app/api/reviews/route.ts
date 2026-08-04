import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/db";
import { JwtService } from "@/services/jwt.service";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    // Fetch only verified reviews
    const dbReviews = await prisma.review.findMany({
      where: { isVerified: true },
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
      const city = r.user.addresses[0]?.city || "Verified Buyer";
      return {
        id: r.id,
        rating: r.rating,
        comment: r.comment,
        name: r.name,
        location: city,
        isVerified: true,
        mediaUrl: r.mediaUrl,
        mediaType: r.mediaType,
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
    const token = cookies().get("rh_access_token")?.value;
    if (!token) {
      return NextResponse.json({ error: "Please log in to write a review." }, { status: 401 });
    }

    const decoded = await JwtService.verifyToken(token);
    if (!decoded || !decoded.sub) {
      return NextResponse.json({ error: "Invalid session. Please log in again." }, { status: 401 });
    }

    const userId = decoded.sub;

    // Check if the user has a paid or cod order to be considered a verified buyer
    const completedOrdersCount = await prisma.order.count({
      where: {
        userId,
        paymentStatus: {
          in: ["paid", "cod"]
        },
      },
    });

    const isVerifiedBuyer = completedOrdersCount > 0;

    if (!isVerifiedBuyer) {
      return NextResponse.json(
        { error: "Only verified buyers who have completed a purchase can submit a review on our site." },
        { status: 403 }
      );
    }

    const body = await req.json();
    const { rating, comment, mediaUrl, mediaType } = body;

    if (!rating || typeof rating !== "number" || rating < 1 || rating > 5) {
      return NextResponse.json({ error: "Please provide a valid rating between 1 and 5." }, { status: 400 });
    }

    if (!comment || typeof comment !== "string" || comment.trim().length < 5) {
      return NextResponse.json({ error: "Comment must be at least 5 characters long." }, { status: 400 });
    }

    // Get user details
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found." }, { status: 404 });
    }

    // Create the review
    const review = await prisma.review.create({
      data: {
        userId,
        name: user.name || "Verified Buyer",
        rating,
        comment: comment.trim(),
        isVerified: true, // User is verified (has paid or cod orders)
        mediaUrl: mediaUrl || null,
        mediaType: mediaType || null,
      },
    });

    return NextResponse.json({ success: true, review });
  } catch (error) {
    console.error("[REVIEWS_POST_FAILED]", error);
    return NextResponse.json({ error: "Failed to submit review." }, { status: 500 });
  }
}
