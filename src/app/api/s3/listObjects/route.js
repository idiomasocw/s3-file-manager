// src/app/api/s3/listObjects/route.js
import { S3Client, ListObjectsV2Command } from "@aws-sdk/client-s3";

const s3Client = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const prefix = searchParams.get("prefix") || "";  // Fetch the "prefix" query parameter for folder navigation

  try {
    const command = new ListObjectsV2Command({
      Bucket: process.env.AWS_S3_BUCKET_NAME,
      Prefix: prefix,
      Delimiter: "/",
    });
    const response = await s3Client.send(command);

    // Separate folders and files
    const folders = (response.CommonPrefixes || []).map((prefix) => ({
      key: prefix.Prefix,
      name: prefix.Prefix.split("/").slice(-2, -1)[0],
      type: "folder",
    }));

    const files = (response.Contents || []).map((content) => ({
      key: content.Key,
      name: content.Key.split("/").pop(),
      lastModified: content.LastModified,
      size: content.Size,
      type: "file",
    }));

    return new Response(JSON.stringify({ folders, files }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error fetching objects from S3:", error);
    return new Response(JSON.stringify({ error: "Failed to list objects" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
