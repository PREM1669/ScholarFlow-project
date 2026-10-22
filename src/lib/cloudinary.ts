import { randomUUID } from "node:crypto";
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

function configureCloudinary() {
  if (!isCloudinaryConfigured()) {
    throw new Error("Cloudinary is not configured");
  }
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true,
  });
}

export async function uploadImageBuffer(
  buffer: Buffer,
  folder: string,
): Promise<{ url: string }> {
  configureCloudinary();

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

export async function uploadRawBuffer(
  buffer: Buffer,
  extension: string,
): Promise<{ url: string; publicId: string }> {
  configureCloudinary();
  const publicId = `assignments/${randomUUID()}.${extension}`;

  return new Promise((resolve, reject) => {
    cloudinary.uploader
      .upload_stream(
        { public_id: publicId, resource_type: "raw", overwrite: false },
        (error, result) => {
          if (error) {
            reject(error);
            return;
          }
          if (!result?.secure_url || !result.public_id) {
            reject(new Error("Cloudinary did not return the uploaded file details"));
            return;
          }
          resolve({ url: result.secure_url, publicId: result.public_id });
        },
      )
      .end(buffer);
  });
}

export async function deleteRawAsset(publicId: string): Promise<boolean> {
  try {
    configureCloudinary();
    const result = await cloudinary.uploader.destroy(publicId, {
      resource_type: "raw",
      invalidate: true,
    });
    if (result.result !== "ok" && result.result !== "not found") {
      console.error(
        `Cloudinary raw asset deletion failed for ${publicId}: ${result.result}`,
      );
      return false;
    }
    return true;
  } catch (error) {
    console.error(`Cloudinary raw asset deletion failed for ${publicId}`, error);
    return false;
  }
}
