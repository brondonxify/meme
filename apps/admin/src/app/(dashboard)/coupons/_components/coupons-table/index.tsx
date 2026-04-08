"use client";

import { useSearchParams } from "next/navigation";
import { useQuery, keepPreviousData } from "@tanstack/react-query";

import CouponsTable from "./Table";
import { getColumns, skeletonColumns } from "./columns";
import TableSkeleton from "@/components/shared/table/TableSkeleton";
import TableError from "@/components/shared/table/TableError";

import { getSearchParams } from "@/helpers/getSearchParams";
import { fetchCoupons } from "@/services/coupons/api";
import { RowSelectionProps } from "@/types/data-table";
import { useAuthorization } from "@/hooks/use-authorization";
import type { BackendCoupon } from "@/types/backend-api";
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

export default function AllCoupons({
  rowSelection,
  setRowSelection,
}: RowSelectionProps) {
  const { hasPermission } = useAuthorization();
  const columns = getColumns({ hasPermission });
  const { page, limit, search } = getSearchParams(useSearchParams());

  const {
    data: couponsData,
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ["coupons", page, limit, search],
    queryFn: () => fetchCoupons({ page, limit, search }),
    placeholderData: keepPreviousData,
  });

  if (isLoading)
    return <TableSkeleton perPage={limit} columns={skeletonColumns} />;

  if (isError || !couponsData)
    return (
      <TableError
        errorMessage="Something went wrong while trying to fetch coupons."
        refetch={refetch}
      />
    );

  const data: BackendCoupon[] = couponsData.items || [];
  const pagination = adaptPagination(
    couponsData.page,
    couponsData.limit,
    couponsData.total
  );

  return (
    <CouponsTable
      columns={columns}
      data={data}
      pagination={pagination}
      rowSelection={rowSelection}
      setRowSelection={setRowSelection}
    />
  );
}
