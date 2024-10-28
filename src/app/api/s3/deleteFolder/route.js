// src/app/api/s3/deleteFolder/route.js
import { S3Client, ListObjectsV2Command, DeleteObjectsCommand } from "@aws-sdk/client-s3";

const s3Client = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

export async function POST(request) {
  const { prefix } = await request.json(); // Folder prefix to delete

  try {
    // Retrieve all objects under the folder prefix
    const listCommand = new ListObjectsV2Command({
      Bucket: process.env.AWS_S3_BUCKET_NAME,
      Prefix: prefix,
    });
    const { Contents } = await s3Client.send(listCommand);

    // If there are objects, prepare them for deletion
    if (Contents && Contents.length > 0) {
      const deleteObjects = Contents.map((item) => ({ Key: item.Key }));

      // Delete all objects (including any "folder marker" objects)
      const deleteCommand = new DeleteObjectsCommand({
        Bucket: process.env.AWS_S3_BUCKET_NAME,
        Delete: { Objects: deleteObjects },
      });
      await s3Client.send(deleteCommand);
    }

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error deleting folder:", error);
    return new Response(JSON.stringify({ error: "Failed to delete folder" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
