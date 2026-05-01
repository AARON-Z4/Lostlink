/**
 * src/services/index.ts — barrel export
 */
export { authService } from "./auth.service";
export { itemsService, adaptBackendItem } from "./items.service";
export { claimsService } from "./claims.service";
export { qrService } from "./qr.service";
export { adminService } from "./admin.service";
export { uploadFile } from "./upload.service";
export { notificationsService } from "./notifications.service";

export type { LoginPayload, RegisterPayload, AuthResponse } from "./auth.service";
export type { ItemsQuery, ItemsResponse, ReportItemPayload, BackendItem, Pagination, Match } from "./items.service";
export type { CreateClaimPayload, BackendClaim, ClaimResolutionStatus } from "./claims.service";
export type { QrData } from "./qr.service";
export type { AdminUser, AdminStats } from "./admin.service";
export type { UploadResponse } from "./upload.service";
export type { BackendNotification, NotificationsResponse } from "./notifications.service";
