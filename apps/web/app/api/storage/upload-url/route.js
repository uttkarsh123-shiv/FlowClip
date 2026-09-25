import { NextResponse } from "next/server";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { s3, BUCKET } from "@/lib/storage";
import { getUserIdFromRequest } from "@/lib/api-middleware";

// POST /api/storage/upload-url
// Returns a presigned PUT URL the extension uses to upload directly to Neon storage.
// Also returns the public imageUrl to store in the DB after upload completes.
export async function POST(request) {
  const userId = await getUserIdFromRequest(request);
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // Unique key per user per timestamp — avoids collisions
    const key         = `screenshots/${userId}/${Date.now()}.jpg`;
    const command     = new PutObjectCommand({
      Bucket:      BUCKET,
      Key:         key,
      ContentType: "image/jpeg",
    });

    // Presigned URL valid for 5 minutes — enough for extension to upload
    const uploadUrl = await getSignedUrl(s3, command, { expiresIn: 300 });

    // Public URL for reading the image after upload
    // Neon path-style: <endpoint>/<bucket>/<key>
    const imageUrl = `${process.env.AWS_ENDPOINT_URL_S3}/${BUCKET}/${key}`;

    return NextResponse.json({ uploadUrl, imageUrl });
  } catch (e) {
    console.error("[storage/upload-url]", e);
    return NextResponse.json({ error: "Failed to generate upload URL" }, { status: 500 });
  }
}
