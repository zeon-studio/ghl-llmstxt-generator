/**
 * lib/ghl/media.ts
 * ----------------
 * Uploads the generated llms.txt content to GHL Media Storage.
 * Uses POST /medias/upload-file (multipart/form-data).
 */

import FormData from "form-data";
import { getGhlClient } from "./client";

export interface UploadResult {
  fileUrl: string;
  fileName: string;
  fileId?: string;
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
 * Uploads a text file to GHL Media Storage for a given location.
 * Returns the public URL of the uploaded file.
 */
export async function uploadLlmsTxt(
  content: string,
  fileName: string,
  locationId: string,
  accessToken: string
): Promise<UploadResult> {
  const client = getGhlClient(accessToken);
  const form = new FormData();

  // Attach the file as a Buffer so FormData sets the correct Content-Type
  const buffer = Buffer.from(content, "utf-8");
  form.append("file", buffer, {
    filename: fileName,
    contentType: "text/plain",
  });
  form.append("name", fileName);
  form.append("locationId", locationId);

  try {
    const uploadResp = await client.post("/medias/upload-file", form, {
      headers: {
        ...form.getHeaders(),
      },
    });

    const data = uploadResp.data;

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
  } catch (error) {
    console.error("[Media] Upload failed:", error);
    throw error;
  }
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
    const client = getGhlClient(accessToken);
    
    const resp = await client.get("/medias/files", {
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
      return;
    }



    for (const file of oldFiles) {
      const idsToTry = [...new Set([file.id, file._id, file.fileId, file.file_id, file.uid].filter(Boolean) as string[])];

      if (idsToTry.length === 0) continue;

      let deleted = false;
      
      for (const id of idsToTry) {
        if (deleted) break;

        // 2. Fallback variants
        const endpointVariants = [
          `/medias/files/${id}?altId=${locationId}&altType=location`,
          `/medias/file/${id}?altId=${locationId}&altType=location`,
          `/medias/files/${id}`,
          `/medias/file/${id}`,
          `/medias/${id}?altId=${locationId}&altType=location`,
          `/medias/${id}`,
        ];

        for (const variant of endpointVariants) {
          try {
            await client.delete(variant);
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
