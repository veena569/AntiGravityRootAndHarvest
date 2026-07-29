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
        createdAt: r.createdAt.toISOString(),
      };
    });

    // Default placeholder testimonials
    const defaultPlaceholderReviews = [
      {
        id: "default-1",
        rating: 5,
        comment: "The purity of the groundnut oil is unmatched. It reminds me of the oil we used to get directly from the village press when I was a child.",
        name: "Meera R.",
        location: "Bangalore",
        isVerified: true,
        createdAt: new Date("2026-06-01").toISOString(),
      },
      {
        id: "default-2",
        rating: 5,
        comment: "Finally, a brand that doesn't just market purity but actually delivers it. You can taste the difference in every meal cooked with this oil.",
        name: "Arjun S.",
        location: "Mumbai",
        isVerified: true,
        createdAt: new Date("2026-06-15").toISOString(),
      },
      {
        id: "default-3",
        rating: 5,
        comment: "Their commitment to transparency and quality is why I trust Root & Harvest for my family's everyday cooking needs.",
        name: "Priya M.",
        location: "Delhi",
        isVerified: true,
        createdAt: new Date("2026-06-28").toISOString(),
      },
    ];

    // Merge DB reviews and default placeholders
    const allReviews = [...formattedDbReviews, ...defaultPlaceholderReviews];

    return NextResponse.json({ reviews: allReviews });
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

    // Check if the user has a paid order to be considered a verified buyer
    const paidOrdersCount = await prisma.order.count({
      where: {
        userId,
        paymentStatus: "paid",
      },
    });

    const isVerifiedBuyer = paidOrdersCount > 0;

    if (!isVerifiedBuyer) {
      return NextResponse.json(
        { error: "Only verified buyers who have completed a purchase can submit a review on our site." },
        { status: 403 }
      );
    }

    const body = await req.json();
    const { rating, comment } = body;

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
        isVerified: true, // User is verified (has paid orders)
      },
    });

    return NextResponse.json({ success: true, review });
  } catch (error) {
    console.error("[REVIEWS_POST_FAILED]", error);
    return NextResponse.json({ error: "Failed to submit review." }, { status: 500 });
  }
}
