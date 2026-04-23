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

interface MediaFile {
  id?: string;
  _id?: string;
  fileId?: string;
  file_id?: string;
  uid?: string;
  name?: string;
  fileName?: string;
  url?: string;
}

/**
 * Finds and deletes old llms_*.txt files in the media library to keep it clean.
 */
export async function cleanupOldLlmsFiles(
  locationId: string,
  accessToken: string,
  currentFileId?: string
) {
  try {
    console.log(`[Media] Cleaning up old llms.txt files for location: ${locationId}`);
    
    const resp = await axios.get(`${API_BASE}/medias/files`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        Version: "2021-07-28",
      },
      params: {
        altId: locationId,
        altType: "location",
        type: "file",
        limit: 20,
        offset: 0,
      },
    });

    const files: MediaFile[] = resp.data?.files || resp.data?.data?.files || [];
    
    // Identify files that look like our generated versions
    const oldFiles = files.filter((f) => {
      const fileName = (f.name || f.fileName || "").toLowerCase();
      const fileId = f.id || f._id || f.fileId || f.file_id || f.uid;

      // Match files with 'llms' and '.txt'
      const isGeneralMatch = fileName.includes("llms") && fileName.endsWith(".txt");

      return (
        isGeneralMatch &&
        fileId !== currentFileId
      );
    });

    if (oldFiles.length === 0) {
      console.log("[Media] No old files found to clean up.");
      return;
    }

    console.log(`[Media] Found ${oldFiles.length} old files. Deleting...`);

    for (const file of oldFiles) {
      let idsToTry = [file.id, file._id, file.fileId, file.file_id, file.uid].filter(Boolean) as string[];
      
      // Extract UUID from URL just in case the API returned a Mongo ID but expects UUID for deletion
      const urlMatch = file.url?.match(/\/media\/([a-f0-9-]+)\.\w+$/);
      if (urlMatch && urlMatch[1]) {
        idsToTry.push(urlMatch[1]);
      }
      
      // Remove duplicates
      idsToTry = [...new Set(idsToTry)];

      if (idsToTry.length === 0) continue;

      let deleted = false;
      
      for (const idToTry of idsToTry) {
        if (deleted) break;

        // Try different known GHL delete endpoints
        const endpointVariations = [
          { url: `${API_BASE}/medias/files/${idToTry}`, useQueryId: false },
          { url: `${API_BASE}/medias/file/${idToTry}`, useQueryId: false },
          { url: `${API_BASE}/medias/${idToTry}`, useQueryId: false },
          { url: `${API_BASE}/medias/files`, useQueryId: true },
        ];

        for (const variation of endpointVariations) {
          try {
            await axios.delete(variation.url, {
              headers: {
                Authorization: `Bearer ${accessToken}`,
                Version: "2021-07-28",
              },
              params: {
                altId: locationId,
                altType: "location",
                ...(variation.useQueryId ? { id: idToTry } : {}),
              },
            });
            console.log(`[Media] Deleted: ${file.name || idToTry} (using ${variation.url})`);
            deleted = true;
            break; // Stop trying variations for this ID
          } catch {
            // Ignore individual variation failures
          }
        }
      }

      if (!deleted) {
        console.error(`[Media] Failed to delete ${file.name} using all known ID and endpoint variations.`);
      }
    }
  } catch (error) {
    console.error("[Media] Cleanup process failed:", error);
  }
}
