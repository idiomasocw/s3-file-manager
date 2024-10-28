// src/app/api/s3/moveObject/route.js
import { S3Client, CopyObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";

const s3Client = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

export async function POST(request) {
  const { sourceKey, destinationKey } = await request.json();

  try {
    // Step 1: Copy the object to the new location
const copyCommand = new CopyObjectCommand({
  Bucket: process.env.AWS_S3_BUCKET_NAME,
  CopySource: encodeURI(`${process.env.AWS_S3_BUCKET_NAME}/${sourceKey}`),
  Key: destinationKey,
});
    const copyResponse = await s3Client.send(copyCommand);

    // Check if the copy operation was successful
    if (copyResponse.$metadata.httpStatusCode !== 200) {
      console.error("Copy operation failed:", copyResponse);
      return new Response(JSON.stringify({ error: "Failed to copy object" }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Step 2: Delete the original object only after successful copy
    const deleteCommand = new DeleteObjectCommand({
      Bucket: process.env.AWS_S3_BUCKET_NAME,
      Key: sourceKey,
    });
    const deleteResponse = await s3Client.send(deleteCommand);

    // Verify that the delete operation succeeded
    if (deleteResponse.$metadata.httpStatusCode !== 204) {
      console.error("Delete operation failed:", deleteResponse);
      return new Response(JSON.stringify({ error: "Failed to delete original object" }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Success response if both operations were successful
    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error moving object:", error);
    return new Response(JSON.stringify({ error: "Failed to move object" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
