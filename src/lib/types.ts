export type ItemStatus = "lost" | "found" | "claimed" | "returned";
export type ClaimStatus = "pending" | "approved" | "rejected";

export const CATEGORIES = [
  "Electronics",
  "Bags & Wallets",
  "Keys",
  "Documents",
  "Jewelry",
  "Clothing",
  "Pets",
  "Other",
] as const;

export type Category = (typeof CATEGORIES)[number];

export interface Item {
  id: string;
  title: string;
  description: string;
  category: Category;
  location: string;
  date: string; // ISO
  image: string;
  status: ItemStatus;
  reportedBy: string;
  reporterName: string;
  createdAt: string;
}

export interface Claim {
  id: string;
  itemId: string;
  itemTitle: string;
  itemImage: string;
  claimantId: string;
  claimantName: string;
  ownerId: string;
  message: string;
  status: ClaimStatus;
  createdAt: string;
}

export interface Notification {
  id: string;
  type: "match" | "claim_update" | "system";
  title: string;
  body: string;
  read: boolean;
  createdAt: string;
  link?: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: "user" | "admin";
  avatar?: string;
}
