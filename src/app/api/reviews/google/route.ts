import { NextResponse } from "next/server";
import { SEO_CONFIG } from "@/config/seo";

export const dynamic = "force-dynamic";

export async function GET() {
  const apiKey = process.env.GOOGLE_MAPS_API_KEY;
  const placeId = process.env.GOOGLE_PLACE_ID;
  const directReviewUrl = SEO_CONFIG.googleReviewUrl;
  const businessUrl = SEO_CONFIG.googleBusinessUrl;

  // If credentials are not configured, return clean fallback
  if (!apiKey || !placeId) {
    return NextResponse.json({
      configured: false,
      googleReviewUrl: directReviewUrl,
      googleBusinessUrl: businessUrl,
      brandName: SEO_CONFIG.brandName,
      message:
        "Official Google Place ID or API Key not configured in environment. Using direct review URL.",
    });
  }

  try {
    const url = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${encodeURIComponent(
      placeId
    )}&fields=name,rating,user_ratings_total,reviews,url&key=${encodeURIComponent(
      apiKey
    )}`;

    const res = await fetch(url, {
      next: { revalidate: 3600 }, // Cache for 1 hour
    });

    if (!res.ok) {
      throw new Error(`Google Places API returned status ${res.status}`);
    }

    const data = await res.json();

    if (data.status !== "OK" || !data.result) {
      return NextResponse.json({
        configured: true,
        success: false,
        error: data.error_message || data.status,
        googleReviewUrl: directReviewUrl,
        googleBusinessUrl: businessUrl,
      });
    }

    const result = data.result;

    const formattedReviews = (result.reviews || []).map((r: any) => ({
      author: r.author_name,
      rating: r.rating,
      comment: r.text,
      time: r.relative_time_description,
      profilePhoto: r.profile_photo_url,
      source: "Google Maps",
    }));

    return NextResponse.json({
      configured: true,
      success: true,
      placeName: result.name,
      rating: result.rating,
      totalRatings: result.user_ratings_total,
      reviews: formattedReviews,
      googleUrl: result.url || businessUrl,
      googleReviewUrl: directReviewUrl,
    });
  } catch (error: any) {
    console.error("[GOOGLE_REVIEWS_FETCH_FAILED]", error);
    return NextResponse.json(
      {
        configured: true,
        success: false,
        error: error.message || "Failed to fetch Google reviews",
        googleReviewUrl: directReviewUrl,
        googleBusinessUrl: businessUrl,
      },
      { status: 500 }
    );
  }
}
