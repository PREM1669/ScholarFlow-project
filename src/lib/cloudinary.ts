import { v2 as cloudinary } from "cloudinary";

export function isCloudinaryConfigured() {
  const values = [
    process.env.CLOUDINARY_CLOUD_NAME,
    process.env.CLOUDINARY_API_KEY,
    process.env.CLOUDINARY_API_SECRET,
  ];
  return values.every((value) => {
    if (!value) return false;
    const normalized = value.trim();
    return (
      normalized.length > 0 &&
      !/^(your[-_ ]|placeholder|<.*>|\*+)/i.test(normalized)
    );
  });
}

function assertCloudinaryConfig() {
  if (!isCloudinaryConfigured()) {
    throw new Error("Cloudinary is not configured");
  }
}

export async function uploadImageBuffer(
  buffer: Buffer,
  folder: string,
): Promise<{ url: string }> {
  assertCloudinaryConfig();
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true,
  });

  return new Promise((resolve, reject) => {
    cloudinary.uploader
      .upload_stream({ folder, resource_type: "image" }, (error, result) => {
        if (error) {
          reject(error);
          return;
        }
        if (!result?.secure_url) {
          reject(new Error("Cloudinary did not return a secure image URL"));
          return;
        }
        resolve({ url: result.secure_url });
      })
      .end(buffer);
  });
}
