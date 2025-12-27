import { NextResponse } from 'next/server';
import { S3Client, PutObjectCommand, HeadBucketCommand, CreateBucketCommand } from "@aws-sdk/client-s3";

// Initialize S3 Client (Server-Side Only)
const s3Client = new S3Client({
    region: process.env.S3_REGION || 'us-east-1',
    endpoint: process.env.S3_ENDPOINT,
    forcePathStyle: true,
    credentials: {
        accessKeyId: process.env.S3_ACCESS_KEY,
        secretAccessKey: process.env.S3_SECRET_KEY,
    }
});

const ensureBucketExists = async (bucketName) => {
    try {
        await s3Client.send(new HeadBucketCommand({ Bucket: bucketName }));
    } catch (error) {
        if (error.name === 'NotFound' || error.$metadata?.httpStatusCode === 404) {
            console.log(`Bucket ${bucketName} not found. Creating...`);
            await s3Client.send(new CreateBucketCommand({ Bucket: bucketName }));
            console.log(`Bucket ${bucketName} created.`);
        } else {
            throw error;
        }
    }
};

export async function POST(req) {
    try {
        const formData = await req.formData();
        const file = formData.get('file');

        if (!file) {
            return NextResponse.json({ error: "No file provided" }, { status: 400 });
        }

        const bucketName = process.env.S3_BUCKET_NAME;
        if (!bucketName) {
            console.error("S3_BUCKET_NAME is not defined");
            return NextResponse.json({ error: "Server configuration error" }, { status: 500 });
        }

        await ensureBucketExists(bucketName);

        const buffer = Buffer.from(await file.arrayBuffer());
        const fileKey = `${Date.now()}-${file.name.replace(/\s/g, '_')}`;

        const uploadParams = {
            Bucket: bucketName,
            Key: fileKey,
            Body: buffer,
            ContentType: file.type,
            ACL: 'public-read', 
        };

        await s3Client.send(new PutObjectCommand(uploadParams));

        // Construct public URL
        // If using MinIO locally, it might be http://localhost:9000/bucket/key
        // If using AWS, it might be https://bucket.s3.region.amazonaws.com/key
        // We'll use the endpoint + bucket + key logic for MinIO compatibility
        const endpoint = process.env.S3_ENDPOINT;
        const publicUrl = `${endpoint}/${bucketName}/${fileKey}`;

        return NextResponse.json({ url: publicUrl });

    } catch (error) {
        console.error("Error uploading to S3:", error);
        return NextResponse.json({ error: "Failed to upload file" }, { status: 500 });
    }
}
