"use client";
import React from "react";
import TransactionTableRow from "./TransactionTableRow";
import { Skeleton } from "./ui/skeleton";
import { Loader2 } from "lucide-react";

const SkeletonRow = () => (
  <tr className={`border-b-[1px] border-b-gray-200`}>
    <td className="p-3 flex items-center gap-2">
      <Skeleton className="h-9 aspect-square rounded-full" />
      <Skeleton className="w-20 h-4" />
    </td>
    <td className={`p-3`}>
      <Skeleton className="w-20 h-4" />
    </td>
    <td className={`p-3`}>
      <Skeleton className="w-20 h-4" />
    </td>
    <td className={`p-3`}>
      <Skeleton className="w-20 h-4" />
    </td>
    <td className={`p-3`}>
      <Skeleton className="w-30 h-4" />
    </td>
  </tr>
);

const TransactionsTable = ({
  transactions,
  loading,
  accountIds,
  hasMore,
  setLimit,
  limit,
}: {
  transactions: Transaction[];
  loading: boolean;
  accountIds: string[];
  hasMore: boolean;
  setLimit: React.Dispatch<React.SetStateAction<number>>;
  limit: number;
}) => {
  return (
    <div className="flex flex-col gap-3">
      <div className="border-[1px] border-gray-100 rounded-lg overflow-hidden">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-[#F9FAFB] border-b-[1px] border-gray-200 text-xs md:text-sm">
              <th className="p-3 text-left font-medium text-theme-gray-light">
                Transaction
              </th>
              <th className="p-3 text-left font-medium text-theme-gray-light">
                Amount
              </th>
              <th className="p-3 text-left font-medium text-theme-gray-light">
                Status
              </th>
              <th className="max-lg:hidden p-3 text-left font-medium text-theme-gray-light">
                Date
              </th>
              <th className="max-lg:hidden p-3 text-left font-medium text-theme-gray-light">
                Category
              </th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              Array.from({ length: limit }).map((_, index) => (
                <SkeletonRow key={index} />
              ))
            ) : transactions.length > 0 ? (
              transactions.map((transaction: Transaction, index: number) => (
                <TransactionTableRow
                  key={index}
                  transaction={transaction}
                  accountIds={accountIds}
                />
              ))
            ) : (
              <tr>
                <td
                  colSpan={5}
                  className={`p-3 text-center text-theme-gray-dark`}
                >
                  No transactions.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      {(hasMore || loading) && (
        <button
          onClick={() => setLimit((prev: number) => prev + 5)}
          disabled={!hasMore || loading}
          className="flex items-center gap-2 font-medium max-md:text-xs text-sm text-theme-d self-center"
        >
          <span>{loading ? "Loading..." : "Load More"}</span>
          {loading && (
            <Loader2
              size={14}
              color="var(--color-theme-d)"
              className="animate-spin"
            />
          )}
        </button>
      )}
    </div>
  );
};

export default TransactionsTable;
