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

    const apiKey = process.env.INSFORGE_API_KEY || "ik_fb808e1ef4e0399e48c5f3b820aeffc5";
    const ossHost = process.env.INSFORGE_OSS_HOST || "https://z77efabp.us-east.insforge.app";

    const uploadUrl = `${ossHost}/api/storage/buckets/reviews/objects/${encodeURIComponent(uniqueFileName)}`;
    
    const sendFormData = new FormData();
    const blob = new Blob([buffer], { type: mime });
    sendFormData.append("file", blob, uniqueFileName);

    const insforgeRes = await fetch(uploadUrl, {
      method: "PUT",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
      },
      body: sendFormData,
    });

    if (!insforgeRes.ok) {
      const errorText = await insforgeRes.text();
      console.error("[INSFORGE_STORAGE_UPLOAD_FAILED]", errorText);
      return NextResponse.json({ error: "Failed to upload file to storage." }, { status: 502 });
    }

    const data = await insforgeRes.json();
    
    // Construct the public download URL returned by InsForge
    const publicUrl = data.url;

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
