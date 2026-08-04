import { NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import { join } from "path";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    
    // Classify media type
    const mime = file.type;
    let mediaType = "image";
    if (mime.startsWith("video/")) {
      mediaType = "video";
    } else if (!mime.startsWith("image/")) {
      return NextResponse.json({ error: "Only image and video uploads are allowed." }, { status: 400 });
    }

    // Ensure uploads directory exists
    const uploadsDir = join(process.cwd(), "public", "uploads");
    await mkdir(uploadsDir, { recursive: true });

    // Generate unique name
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 1000);
    const sanitizedName = file.name.replace(/[^a-zA-Z0-9.]/g, "_");
    const uniqueFileName = `${timestamp}_${random}_${sanitizedName}`;
    const filePath = join(uploadsDir, uniqueFileName);

    // Write file to public/uploads
    await writeFile(filePath, buffer);

    const publicUrl = `/uploads/${uniqueFileName}`;

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
