"use client";
import AccountCard from "@/components/AccountCard";
import { Filter, Plus } from "lucide-react";
import React, { useEffect, useState } from "react";
import UniSelect from "@/components/UniSelect";
import TransactionsTable from "@/components/TransactionsTable";
import { Skeleton } from "@/components/ui/skeleton";
import { useSelector } from "react-redux";
import { RootState } from "@/lib/store";
import { useQuery } from "@apollo/client";
import { toast } from "sonner";
import { filterTransactions } from "../../../../utils/utils";
import RegisterAccount from "@/components/RegisterAccount";
import NotFound from "@/components/NotFound";
import PageHeader from "@/components/PageHeader";
import { GET_ACCOUNTS, GET_MULTIPLE_TRANSACTIONS } from "@/lib/queries";
import { useRefetchOnAccountsChange } from "@/hooks/useRefetchTrigger";

const Accounts = () => {
  const [filter, setFilter] = useState<string>();
  const [filteredTransactions, setFilteredTransactions] =
    useState<Transaction[]>();
  const [limit, setLimit] = useState(5);

  const user = useSelector((state: RootState) => state.user.userInfo);

  const {
    data: accountsData,
    loading: accountsLoading,
    error: accountsError,
    refetch: refetchAccounts,
  } = useQuery(GET_ACCOUNTS, { variables: { userId: user?.id } });

  const {
    data: transactionsData,
    loading: transactionsLoading,
    error: transactionsError,
    refetch: refetchTransactions,
  } = useQuery(GET_MULTIPLE_TRANSACTIONS, {
    variables: {
      accountIds: accountsData?.getAccounts?.map((acc: Account) => acc.id),
      limit,
      userId: user?.id,
    },
    skip: !accountsData?.getAccounts || accountsLoading,
  });

  useEffect(() => {
    if (transactionsError) {
      toast.error("Error loading transactions", {
        description: transactionsError.message,
      });
    }
    if (accountsError) {
      toast.error("Error loading accounts", {
        description: accountsError.message,
      });
    }
  }, [transactionsError, accountsError]);

  useEffect(() => {
    if (!transactionsLoading && transactionsData?.getMultipleTransactions && filter) {
      const trx = filterTransactions(
        filter,
        transactionsData.getMultipleTransactions.transactions ?? []
      );
      setFilteredTransactions(trx);
    }
  }, [filter, transactionsData?.getMultipleTransactions, transactionsLoading]);

  useRefetchOnAccountsChange(refetchAccounts, refetchTransactions);

  return (
    <div className="flex-1 flex flex-col gap-6 max-md:px-3 px-6 max-md:py-6 py-8 min-h-[80dvh] min-w-0">
      <PageHeader
        title="My Accounts"
        description="Effortlessly Manage Your Banking Accounts"
        action={
          <RegisterAccount>
            <button className="flex items-center gap-2">
              <Plus size={14} color="var(--color-theme-d)" />
              <span className="text-sm text-theme-d font-medium">
                New Account
              </span>
            </button>
          </RegisterAccount>
        }
      />

      <div
        className={`${
          accountsData?.getAccounts?.length === 0 && "flex-1"
        } flex flex-col gap-2`}
      >
        {accountsLoading ? (
          <>
            <Skeleton className="h-[150px] w-full" />
            <Skeleton className="h-[150px] w-full" />
            <Skeleton className="h-[150px] w-full" />
          </>
        ) : accountsData?.getAccounts?.length > 0 ? (
          accountsData.getAccounts.map((item: Account, index: number) => (
            <AccountCard
              key={index}
              account={item}
            />
          ))
        ) : (
          <NotFound message="No Accounts found." />
        )}
      </div>

      <div className="flex items-center justify-between">
        <h4>Transaction history</h4>
        {!accountsLoading &&
          accountsData?.getAccounts?.length > 0 &&
          !transactionsLoading &&
          transactionsData?.getMultipleTransactions?.transactions?.length > 0 && (
            <UniSelect
              className="w-fit max-md:p-2 max-md:text-xs"
              value={filter}
              setValue={setFilter}
              icon={<Filter size={12} color="gray" />}
              placeholder="Filter"
              options={[
                { title: "All", value: "all" },
                { title: "Latest", value: "latest" },
                { title: "Oldest", value: "oldest" },
                { title: "Largest amounts", value: "largest" },
                { title: "Smallest amounts", value: "smallest" },
                { title: "Pending", value: "pending" },
                { title: "Completed", value: "completed" },
                { title: "Declined", value: "declined" },
                { title: "Entertainment", value: "entertainment" },
                { title: "Travel", value: "travel" },
                { title: "Food", value: "food" },
                { title: "Debt", value: "debt" },
                { title: "General", value: "general" },
              ]}
            />
          )}
      </div>

      <TransactionsTable
        limit={limit}
        setLimit={setLimit}
        hasMore={transactionsData?.getMultipleTransactions?.hasMore}
        transactions={
          filteredTransactions ??
          transactionsData?.getMultipleTransactions?.transactions ??
          []
        }
        loading={transactionsLoading || accountsLoading}
        accountIds={
          accountsData?.getAccounts?.map((item: Account) => item.id) ?? []
        }
      />
    </div>
  );
};

export default Accounts;
