import { NextRequest, NextResponse } from "next/server";
import { v2 as cloudinary } from "cloudinary";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
    const apiKey = process.env.CLOUDINARY_API_KEY;
    const apiSecret = process.env.CLOUDINARY_API_SECRET;

    // Check for missing credentials explicitly
    if (!cloudName || !apiKey || !apiSecret) {
      const missing = { cloudName: !!cloudName, apiKey: !!apiKey, apiSecret: !!apiSecret };
      console.error("CLOUD_UPLOAD_ERROR: Missing:", missing);

      // Fallback: local storage for local dev environment ONLY
      if (process.env.NODE_ENV === "development") {
        console.log("DEV_MODE: Using local storage fallback since Cloudinary keys are missing.");
        const { writeFile, mkdir } = await import("fs/promises");
        const { join } = await import("path");
        const bytes = await file.arrayBuffer();
        let buffer = Buffer.from(bytes);
        const uploadDir = join(process.cwd(), "public", "uploads");
        try { await mkdir(uploadDir, { recursive: true }); } catch { }
        const uniqueId = Date.now() + "-" + Math.random().toString(36).substring(2, 9);
        const isImage = file.type.startsWith("image/");
        let ext = file.name.split(".").pop() || "";

        // Mirror the Cloudinary transform (resize + compress) so local dev
        // doesn't end up serving multi-MB raw camera photos on every page.
        if (isImage) {
          try {
            const sharp = (await import("sharp")).default;
            const lowerExt = ext.toLowerCase();
            const resized = sharp(buffer, { animated: lowerExt === "gif" })
              .resize({ width: 1800, height: 1800, fit: "inside", withoutEnlargement: true });

            // PNG/GIF may carry transparency - keep it. Everything else -> jpeg.
            if (lowerExt === "png") {
              buffer = await resized.png({ quality: 80, compressionLevel: 9 }).toBuffer();
            } else if (lowerExt === "gif") {
              buffer = await resized.gif().toBuffer();
            } else {
              buffer = await resized.jpeg({ quality: 80 }).toBuffer();
              ext = "jpg";
            }
          } catch (compressErr) {
            console.error("LOCAL_IMAGE_COMPRESS_ERROR:", compressErr);
          }
        }

        const fileName = `${uniqueId}.${ext}`;
        await writeFile(join(uploadDir, fileName), buffer);
        return NextResponse.json({ url: `/uploads/${fileName}` });
      }

      return NextResponse.json({
        error: "Cloud storage credentials not configured",
        debug: missing
      }, { status: 500 });
    }

    // Configure Cloudinary inside the handler
    cloudinary.config({
      cloud_name: cloudName,
      api_key: apiKey,
      api_secret: apiSecret,
    });

    // Upload to Cloudinary
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const result = await new Promise<any>((resolve, reject) => {
      const resourceType = file.type.startsWith("video/") ? "video" : "image";
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: "sportsurf",
          resource_type: resourceType,
          transformation: resourceType === 'image' ? [
            { width: 1800, height: 1800, crop: "limit" },
            { quality: "auto:good" },
            { fetch_format: "auto" }
          ] : [
            { quality: "auto:good" },
            { fetch_format: "auto" }
          ]
        },
        (error, result) => {
          if (error) {
            console.error("CLOUDINARY_STREAM_ERROR:", error);
            reject(error);
          } else {
            resolve(result);
          }
        }
      );
      uploadStream.end(buffer);
    });

    const response = NextResponse.json({ url: result.secure_url });

    // Add CORS headers to allow Vercel to talk to Railway
    response.headers.set("Access-Control-Allow-Origin", "*");
    response.headers.set("Access-Control-Allow-Methods", "POST, OPTIONS");
    response.headers.set("Access-Control-Allow-Headers", "Content-Type, Authorization");

    return response;
  } catch (error: any) {
    console.error("CRITICAL UPLOAD API ERROR:", error);
    const errorResponse = NextResponse.json({
      error: error.message || "Upload failed",
      cloudinary_error: error
    }, { status: 500 });

    errorResponse.headers.set("Access-Control-Allow-Origin", "*");
    return errorResponse;
  }
}

// Add OPTIONS handler for CORS preflight
export async function OPTIONS() {
  const response = new NextResponse(null, { status: 204 });
  response.headers.set("Access-Control-Allow-Origin", "*");
  response.headers.set("Access-Control-Allow-Methods", "POST, OPTIONS");
  response.headers.set("Access-Control-Allow-Headers", "Content-Type, Authorization");
  return response;
}
