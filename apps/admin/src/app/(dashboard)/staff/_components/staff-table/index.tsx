"use client";

import { useSearchParams } from "next/navigation";
import { useQuery, keepPreviousData } from "@tanstack/react-query";

import StaffTable from "./Table";
import { getColumns, skeletonColumns } from "./columns";
import TableError from "@/components/shared/table/TableError";
import TableSkeleton from "@/components/shared/table/TableSkeleton";

import { getSearchParams } from "@/helpers/getSearchParams";
import { fetchStaff, fetchStaffRoles } from "@/services/staff/api";
import { useAuthorization } from "@/hooks/use-authorization";
import type { BackendStaff, BackendStaffRole } from "@/types/backend-api";
import type { Pagination } from "@/types/pagination";

function adaptPagination(
  page: number,
  limit: number,
  total: number
): Pagination {
  const totalPages = Math.ceil(total / limit);
  return {
    limit,
    current: page,
    items: total,
    pages: totalPages,
    next: page < totalPages ? page + 1 : null,
    prev: page > 1 ? page - 1 : null,
  };
}

export default function AllStaff() {
  const { hasPermission, isSelf } = useAuthorization();
  const columns = getColumns({ hasPermission, isSelf });
  const { page, limit, search, role } = getSearchParams(useSearchParams());

  const {
    data: staffData,
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ["staff", page, limit, search, role],
    queryFn: () => fetchStaff({ page, limit, search, role }),
    placeholderData: keepPreviousData,
  });

  const { data: rolesData } = useQuery({
    queryKey: ["staff_roles"],
    queryFn: () => fetchStaffRoles(),
    staleTime: 5 * 60 * 1000,
  });

  if (isLoading)
    return <TableSkeleton perPage={limit} columns={skeletonColumns} />;

  if (isError || !staffData)
    return (
      <TableError
        errorMessage="Something went wrong while trying to fetch staff."
        refetch={refetch}
      />
    );

  const data: BackendStaff[] = staffData.items || [];
  const pagination = adaptPagination(
    staffData.page,
    staffData.limit,
    staffData.total
  );

  const roles: BackendStaffRole[] = rolesData?.items || [];

  return (
    <StaffTable
      columns={columns}
      data={data}
      pagination={pagination}
      roles={roles}
    />
  );
}
