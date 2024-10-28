// src/app/api/s3/createFolder/route.js
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";

const s3Client = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

export async function POST(request) {
  const { prefix } = await request.json();  // Folder path

  try {
    const command = new PutObjectCommand({
      Bucket: process.env.AWS_S3_BUCKET_NAME,
      Key: `${prefix}`,  // S3 requires folder paths to end with a "/"
    });
    await s3Client.send(command);

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error creating folder:", error);
    return new Response(JSON.stringify({ error: "Failed to create folder" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
