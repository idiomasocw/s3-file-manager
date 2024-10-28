// src/app/api/s3/uploadFile/route.js
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { NextResponse } from "next/server";
import mime from "mime-types"; // For inferring Content-Type

const s3Client = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

export async function POST(req) {
  try {
    // Parse the key from the request URL search parameters
    const { searchParams } = new URL(req.url);
    const key = searchParams.get("key");

    if (!key) {
      return NextResponse.json(
        { error: "Missing 'key' parameter in request." },
        { status: 400 }
      );
    }

    // Read the file from the request body as a buffer
    const fileBuffer = await req.arrayBuffer();
    const buffer = Buffer.from(fileBuffer);

    // Infer the Content-Type using the file extension
    const contentType = mime.lookup(key) || "application/octet-stream";

    // Upload the file to S3 with Content-Type
    const uploadParams = {
      Bucket: process.env.AWS_S3_BUCKET_NAME,
      Key: key,
      Body: buffer,
      ContentType: contentType, // Set Content-Type explicitly
    };

    await s3Client.send(new PutObjectCommand(uploadParams));

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error("Error uploading file to S3:", error);
    return NextResponse.json(
      { error: "Error uploading file to S3" },
      { status: 500 }
    );
  }
}
