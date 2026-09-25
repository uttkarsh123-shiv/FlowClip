import { S3Client } from "@aws-sdk/client-s3";

if (!process.env.AWS_ENDPOINT_URL_S3)  throw new Error("AWS_ENDPOINT_URL_S3 is not set");
if (!process.env.AWS_ACCESS_KEY_ID)    throw new Error("AWS_ACCESS_KEY_ID is not set");
if (!process.env.AWS_SECRET_ACCESS_KEY) throw new Error("AWS_SECRET_ACCESS_KEY is not set");

// Neon Object Storage requires forcePathStyle: true
export const s3 = new S3Client({
  endpoint:        process.env.AWS_ENDPOINT_URL_S3,
  region:          process.env.AWS_REGION ?? "ap-southeast-1",
  forcePathStyle:  true,
  credentials: {
    accessKeyId:     process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

export const BUCKET = "assets";
