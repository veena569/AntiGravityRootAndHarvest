import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    const mime = file.type;
    let mediaType = "image";
    if (mime.startsWith("video/")) {
      mediaType = "video";
    } else if (!mime.startsWith("image/")) {
      return NextResponse.json({ error: "Only image and video uploads are allowed." }, { status: 400 });
    }

    // Generate unique name
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 1000);
    const sanitizedName = file.name.replace(/[^a-zA-Z0-9.]/g, "_");
    const uniqueFileName = `${timestamp}_${random}_${sanitizedName}`;

    // Read file as buffer/arrayBuffer
    const buffer = await file.arrayBuffer();

    const bucket = process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET;
    if (!bucket) {
      return NextResponse.json({ error: "Storage bucket configuration is missing." }, { status: 500 });
    }

    // Upload to Firebase Storage via REST API (server-side, no CORS!)
    const uploadUrl = `https://firebasestorage.googleapis.com/v0/b/${bucket}/o?uploadType=media&name=reviews/${uniqueFileName}`;
    
    const firebaseRes = await fetch(uploadUrl, {
      method: "POST",
      headers: {
        "Content-Type": mime,
      },
      body: buffer,
    });

    if (!firebaseRes.ok) {
      const errorText = await firebaseRes.text();
      console.error("[FIREBASE_REST_UPLOAD_FAILED]", errorText);
      return NextResponse.json({ error: "Failed to upload file to storage." }, { status: 502 });
    }

    const data = await firebaseRes.json();
    
    // Construct the public download URL
    const downloadToken = data.downloadTokens || "";
    const publicUrl = `https://firebasestorage.googleapis.com/v0/b/${bucket}/o/reviews%2F${uniqueFileName}?alt=media${downloadToken ? `&token=${downloadToken}` : ""}`;

    return NextResponse.json({ 
      success: true, 
      mediaUrl: publicUrl,
      mediaType: mediaType
    });
  } catch (error: any) {
    console.error("[UPLOAD_ERROR]", error);
    return NextResponse.json({ error: "Failed to upload file." }, { status: 500 });
  }
}
