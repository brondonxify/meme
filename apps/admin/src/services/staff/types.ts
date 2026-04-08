import { Pagination } from "@/types/pagination";
import { Staff, StaffRole } from "./index";

export type StaffStatus = "active" | "inactive";

export interface FetchStaffParams {
  page?: number;
  limit?: number;
  search?: string;
  role?: string;
}

export interface FetchStaffResponse {
  data: Staff[];
  pagination: Pagination;
}

export type StaffRolesDropdown = Pick<StaffRole, "name" | "display_name">;
