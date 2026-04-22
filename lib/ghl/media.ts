/**
 * lib/ghl/media.ts
 * ----------------
 * Uploads the generated llms.txt content to GHL Media Storage.
 * Uses POST /medias/upload-file (multipart/form-data).
 */

import axios from "axios";
import FormData from "form-data";

const API_BASE =
  process.env.GHL_API_BASE_URL ?? "https://services.leadconnectorhq.com";

export interface UploadResult {
  fileUrl: string;
  fileName: string;
  fileId?: string;
}

/**
 * Uploads a text file to GHL Media Storage for a given location.
 * Returns the public URL of the uploaded file.
 */
export async function uploadLlmsTxt(
  content: string,
  fileName: string,
  locationId: string,
  accessToken: string
): Promise<UploadResult> {
  const form = new FormData();

  // Attach the file as a Buffer so FormData sets the correct Content-Type
  const buffer = Buffer.from(content, "utf-8");
  form.append("file", buffer, {
    filename: fileName,
    contentType: "text/plain",
  });
  form.append("name", fileName);
  form.append("locationId", locationId);

  const resp = await axios.post(`${API_BASE}/medias/upload-file`, form, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      Version: "2021-07-28",
      ...form.getHeaders(),
    },
  });

  const data = resp.data;

  // GHL returns either { url, fileName } or { fileUrl, fileName, id }
  const fileUrl: string =
    data?.url ?? data?.fileUrl ?? data?.data?.url ?? "";

  if (!fileUrl) {
    throw new Error(
      `Upload succeeded but no URL returned. Response: ${JSON.stringify(data)}`
    );
  }

  return {
    fileUrl,
    fileName: data?.fileName ?? fileName,
    fileId: data?.id ?? data?.fileId,
  };
}
