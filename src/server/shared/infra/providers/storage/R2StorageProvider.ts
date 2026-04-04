import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import type { StorageProvider } from "./StorageProvider";

function getR2Client(): S3Client {
    const accountId = process.env.R2_ACCOUNT_ID;
    const accessKeyId = process.env.R2_ACCESS_KEY_ID;
    const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY;

    if (!accountId || !accessKeyId || !secretAccessKey) {
        throw new Error("R2 storage credentials not configured (R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY)");
    }

    return new S3Client({
        region: "auto",
        endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
        credentials: { accessKeyId, secretAccessKey },
    });
}

export class R2StorageProvider implements StorageProvider {
    async upload({ key, buffer, contentType }: StorageProvider.UploadParams): Promise<string> {
        const bucket = process.env.R2_BUCKET_NAME;
        if (!bucket) throw new Error("R2_BUCKET_NAME not configured");

        const client = getR2Client();
        await client.send(new PutObjectCommand({
            Bucket: bucket,
            Key: key,
            Body: buffer,
            ContentType: contentType,
        }));

        const publicUrl = process.env.R2_PUBLIC_URL;
        if (publicUrl) return `${publicUrl.replace(/\/$/, "")}/${key}`;

        const accountId = process.env.R2_ACCOUNT_ID!;
        return `https://${accountId}.r2.cloudflarestorage.com/${bucket}/${key}`;
    }
}
