export interface SSOSession {
  locationId: string;
  userId: string;
  companyId?: string;
  userName?: string;
  email?: string;
}

export interface GenerateResult {
  success: boolean;
  fileUrl?: string;
  fileName?: string;
  funnelCount?: number;
  pageCount?: number;
  redirect?: { path: string; targetUrl: string } | null;
  preview?: string;
  content?: string;
  error?: string;
  details?: string;
}

export type Status =
  | "idle"
  | "loading-sso"
  | "ready"
  | "generating"
  | "previewing"
  | "pushing"
  | "done"
  | "error";
