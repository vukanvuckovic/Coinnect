import React from "react";
import {
  capitalizeFirstLetter,
  formatAmount,
  formatDate,
} from "../../utils/utils";
import { Mail } from "lucide-react";
import { budgetCategories } from "@/constants/data";
import TransactionInfo from "./TransactionInfo";

const TransactionTableRow = ({
  transaction,
  accountIds,
}: {
  transaction: Transaction;
  accountIds: string[];
}) => {
  const negative = accountIds.includes(transaction?.sender?.id);
  const selfTransaction =
    accountIds.includes(transaction?.sender?.id) &&
    accountIds.includes(transaction?.receiver?.id);

  const categoryColor = budgetCategories.find(
    (item) => item.name === transaction.category
  )?.color;

  return (
    !selfTransaction && (
      <TransactionInfo
        loading={!transaction}
        transaction={transaction}
      >
        <tr
          className={`border-b-[1px] border-b-gray-200 cursor-pointer ${
            transaction.status === "completed"
              ? "bg-green-50/40"
              : transaction.status === "declined"
              ? "bg-red-50/40"
              : "opacity-70"
          }`}
        >
          <td className="p-3 flex items-center gap-2 md:gap-3">
            <div className="h-6 md:h-9 aspect-square flex justify-center items-center rounded-full bg-theme-d relative">
              <span className="font-semibold text-sm md:text-lg text-white">
                {transaction?.sender?.owner?.firstName[0]?.toUpperCase() ??
                  transaction?.senderStatic.firstName[0].toUpperCase()}
              </span>
              {transaction.note && (
                <div className="h-3.5 md:h-5 aspect-square rounded-full flex justify-center items-center bg-red-600 absolute -top-1.5 -right-1 md:-right-2">
                  <div className="max-md:hidden">
                    <Mail
                      size={12}
                      color="white"
                    />
                  </div>
                  <div className="md:hidden">
                    <Mail
                      size={8}
                      color="white"
                    />
                  </div>
                </div>
              )}
            </div>
            <span className="max-md:text-sm text-theme-gray-dark font-medium">
              {transaction?.sender?.owner?.firstName ??
                transaction.senderStatic.firstName}
            </span>
          </td>
          <td
            className={`p-3 ${
              transaction.status === "declined"
                ? "text-gray-400"
                : negative
                ? "text-red-500"
                : "text-green-600"
            } font-semibold max-md:text-sm text-lg`}
          >
              {formatAmount(transaction?.amount)}
          </td>
          <td className="p-3">
            <div
              className={`flex items-center px-[7px] max-md:h-[18px] h-[22px] rounded-full ${
                transaction.status === "pending"
                  ? "bg-gray-100/80"
                  : transaction.status === "declined"
                  ? "bg-red-100/80"
                  : "bg-green-100/80"
              } w-fit`}
            >
              <div
                className={`max-md:h-1.5 h-2 aspect-square rounded-full ${
                  transaction.status === "pending"
                    ? "bg-gray-600"
                    : transaction.status === "declined"
                    ? "bg-red-600"
                    : "bg-green-600"
                }`}
              />
              <span
                className={`${
                  transaction.status === "pending"
                    ? "text-gray-800"
                    : transaction.status === "declined"
                    ? "text-red-800"
                    : "text-green-800"
                } max-md:text-[10px] text-xs px-1.5 md:px-2`}
              >
                {capitalizeFirstLetter(transaction.status)}
              </span>
            </div>
          </td>
          <td className="max-lg:hidden p-3 text-theme-gray-dark font-medium text-sm">
            {formatDate(new Date(Number(transaction.createdAt)))}
          </td>
          <td className="max-lg:hidden p-3">
            <div
              style={{
                borderColor: categoryColor ?? "var(--color-theme-d)",
              }}
              className={`flex items-center w-fit px-[6px] h-[22px] rounded-full border-[1px]`}
            >
              <div
                style={{
                  backgroundColor: categoryColor ?? "var(--color-theme-d)",
                }}
                className="h-2 aspect-square rounded-full"
              />
              <span
                style={{
                  color: categoryColor ?? "var(--color-theme-d)",
                }}
                className={`font-medium text-xs px-2`}
              >
                {capitalizeFirstLetter(transaction.category)}
              </span>
            </div>
          </td>
        </tr>
      </TransactionInfo>
    )
  );
};

export default TransactionTableRow;
