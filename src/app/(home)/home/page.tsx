"use client";
import { Plus } from "lucide-react";
import React, { useEffect, useState } from "react";
import Card from "../../../components/Card";
import BudgetCard from "@/components/BudgetCard";
import TransactionsTable from "@/components/TransactionsTable";
import { useQuery } from "@apollo/client";
import Link from "next/link";
import { Skeleton } from "@/components/ui/skeleton";
import { useSelector } from "react-redux";
import { RootState } from "@/lib/store";
import { BalanceChart } from "@/components/BalanceChart";
import { budgetCategories } from "@/constants/data";
import { AccountsChart } from "@/components/AccountsChart";
import { budgetsEmpty, formatAmount } from "../../../../utils/utils";
import { totalBalance } from "@/lib/utils";
import { toast } from "sonner";
import NotFound from "@/components/NotFound";
import {
  GET_ACCOUNTS,
  GET_CARDS,
  GET_MULTIPLE_TRANSACTIONS,
  GET_BUDGETS_SUMMARY,
  GET_MONTHLY_SPENDING_RECAP,
} from "@/lib/queries";
import {
  useRefetchOnAccountsChange,
  useRefetchOnTransactionsChange,
} from "@/hooks/useRefetchTrigger";

const Home = () => {
  const [limit, setLimit] = useState(5);
  const [selectedAccount, setSelectedAccount] = useState<Account>();

  const user = useSelector((state: RootState) => state.user.userInfo);

  const {
    data: cardsData,
    error: cardsError,
    loading: cardsLoading,
    refetch: refetchCards,
  } = useQuery(GET_CARDS, { variables: { userId: user?.id } });

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
      accountIds: selectedAccount
        ? [selectedAccount.id]
        : accountsData?.getAccounts?.map((acc: Account) => acc.id),
      limit,
      userId: user?.id,
    },
    skip: !accountsData?.getAccounts || accountsLoading,
  });

  const {
    data: reportData,
    loading: reportLoading,
    error: reportError,
  } = useQuery(GET_MONTHLY_SPENDING_RECAP, {
    variables: {
      accountIds: user?.accounts?.map((item) => item.id) ?? [],
      userId: user?.id,
    },
  });

  const {
    data: budgetsData,
    loading: budgetsLoading,
    error: budgetsError,
    refetch: budgetsRefetch,
  } = useQuery(GET_BUDGETS_SUMMARY, { variables: { ownerId: user?.id } });

  useEffect(() => {
    if (cardsError) toast.error("Error loading cards", { description: cardsError.message });
    if (accountsError) toast.error("Error loading accounts", { description: accountsError.message });
    if (transactionsError) toast.error("Error loading transactions", { description: transactionsError.message });
    if (reportError) toast.error("Error loading spending summary", { description: reportError.message });
    if (budgetsError) toast.error("Error loading budget details", { description: budgetsError.message });
  }, [budgetsError, reportError, transactionsError, accountsError, cardsError]);

  useRefetchOnAccountsChange(refetchAccounts, refetchTransactions, refetchCards);
  useRefetchOnTransactionsChange(budgetsRefetch, refetchTransactions);

  return (
    <>
      <div className="flex-1 min-w-0">
        <div className="flex flex-col gap-6 px-3 md:px-6 py-6 md:py-8">
          <div className="flex flex-col gap-1">
            <h2 data-test="welcome-heading">
              Welcome, <span className="text-theme-d">{user?.firstName}</span>
            </h2>
            <span className="max-md:text-xs text-theme-gray-light">
              Access & manage your account and transactions efficiently.
            </span>
          </div>

          {accountsLoading ? (
            <Skeleton className="h-[150px] w-full" />
          ) : (
            <div className="flex items-center rounded-xl custom-shadow">
              <AccountsChart accounts={accountsData?.getAccounts ?? []} />
              <div className="flex-1 flex flex-col gap-2">
                <span className="max-md:text-sm font-semibold text-theme-gray-dark-2">
                  {accountsData?.getAccounts?.length === 0
                    ? "No Accounts"
                    : `${accountsData?.getAccounts?.length} Account${accountsData?.getAccounts?.length !== 1 ? "s" : ""}`}
                </span>
                <div className="flex flex-col gap-1">
                  <span className="font-medium max-md:text-xs text-sm text-theme-gray-light">
                    Total current balance
                  </span>
                  <span className="max-md:text-xl text-3xl font-semibold text-theme-gray-dark-2">
                    {formatAmount(totalBalance(accountsData?.getAccounts ?? []))}
                  </span>
                </div>
              </div>
              <Link
                href={"/accounts"}
                className="max-md:hidden flex items-center gap-2 self-start py-4 px-5 cursor-pointer"
              >
                <Plus size={14} color="#0179FE" />
                <span className="text-theme-d text-sm font-semibold">
                  Add Account
                </span>
              </Link>
            </div>
          )}

          {reportLoading ? (
            <Skeleton className="h-[300px] w-full" />
          ) : (
            <BalanceChart
              noTransactions={
                transactionsData?.getMultipleTransactions?.length === 0
              }
              monthlyRecap={reportData?.getMonthlySpendingRecap ?? []}
            />
          )}

          <div className="flex items-center justify-between">
            <h3 className="text-theme-gray-dark-2">Recent transactions</h3>
            <button
              onClick={() => setSelectedAccount(undefined)}
              className="standard-button"
            >
              View all
            </button>
          </div>

          {accountsLoading ? (
            <Skeleton className="h-10" />
          ) : (
            accountsData?.getAccounts?.length > 1 && (
              <div className="w-full min-w-0 relative">
                <div className="w-full min-w-0 overflow-x-scroll scrollbar-none">
                  <div className="flex gap-8 h-6 md:h-10 px-2 md:px-4">
                    {accountsData.getAccounts.map((item: Account) => {
                      const selected = item.id === selectedAccount?.id;
                      return (
                        <button
                          key={item.id}
                          onClick={() => setSelectedAccount(item)}
                          className={`shrink-0 border-b-[2px] duration-200 max-md:text-xs ${
                            selected
                              ? "border-theme-d text-theme-d font-semibold"
                              : "border-gray-200 text-gray-400 font-medium"
                          }`}
                        >
                          {item.accountName}
                        </button>
                      );
                    })}
                  </div>
                </div>
                <div className="h-10 w-2 md:w-4 absolute top-0 left-0 bg-[linear-gradient(to_right,white,transparent)]" />
                <div className="h-10 w-2 md:w-4 absolute top-0 right-0 bg-[linear-gradient(to_left,white,transparent)]" />
              </div>
            )
          )}

          {!accountsLoading &&
            accountsData?.getAccounts?.length > 0 &&
            selectedAccount && (
              <div className="flex justify-between items-center gap-4 p-4 md:p-6 bg-theme-blue-light rounded-xl relative">
                <div className="flex max-md:flex-col items-start md:items-center gap-2 md:gap-6">
                  <div className="h-12 md:h-16 aspect-square rounded-full bg-theme-d flex justify-center items-center">
                    <h3 className="text-white">CB</h3>
                  </div>
                  <div className="flex flex-col gap-1">
                    <h4>Coinnect Bank</h4>
                    <h5 className="text-theme-gray-dark-2">
                      {selectedAccount.accountName}
                    </h5>
                    <span className="md:text-lg font-semibold text-theme-d">
                      {formatAmount(selectedAccount.balance ?? 0)}
                    </span>
                  </div>
                </div>
                <span className="uppercase self-center max-md:text-[10px] text-xs text-green-700 bg-green-200 px-3 py-1.5 rounded-full max-md:absolute top-3 right-3">
                  {selectedAccount.type}
                </span>
              </div>
            )}

          {user?.accounts && user.accounts.length > 0 ? (
            <TransactionsTable
              limit={limit}
              setLimit={setLimit}
              hasMore={transactionsData?.getMultipleTransactions?.hasMore}
              transactions={
                transactionsData?.getMultipleTransactions?.transactions ?? []
              }
              loading={transactionsLoading}
              accountIds={
                accountsData?.getAccounts?.map((item: Account) => item.id) ?? []
              }
            />
          ) : (
            <NotFound message="No accounts found." />
          )}
        </div>
      </div>

      <div className="shrink-0 max-xl:hidden w-[400px] h-[100dvh] overflow-y-scroll scrollbar-none flex flex-col border-l-[1px] border-l-gray-200 sticky top-0">
        <div className="h-[120px] shrink-0 bg-[url('/abstract.png')] bg-cover bg-center" />
        <div className="flex-1 flex flex-col gap-8 px-4 pb-8">
          <div className="flex flex-col items-start gap-4 -mt-10">
            <div className="h-24 aspect-square rounded-full bg-gray-100 border-6 border-white shadow-lg shadow-gray-200 flex justify-center items-center">
              <span className="text-5xl font-bold uppercase text-theme-d">
                {user?.firstName?.[0]}
              </span>
            </div>
            <div className="flex flex-col gap-1">
              <h3 className="leading-none truncate whitespace-nowrap overflow-hidden">
                {user?.firstName} {user?.lastName}
              </h3>
              <span className="text-theme-gray-light leading-none truncate whitespace-nowrap overflow-hidden">
                {user?.email}
              </span>
            </div>
          </div>

          <div className="flex flex-col gap-4">
            <h4>My Cards</h4>
            <div className="relative pb-8">
              {cardsLoading ? (
                <>
                  <Skeleton className="w-[320px] h-[190px]" />
                  <Skeleton className="w-[320px] h-[190px] absolute bottom-0 right-0 -z-10 opacity-90" />
                </>
              ) : cardsData?.getCards?.length > 0 ? (
                <>
                  <Card card={cardsData.getCards[0]} />
                  <div className="absolute bottom-0 right-0 -z-10 opacity-90">
                    {cardsData.getCards[1] ? (
                      <Card card={cardsData.getCards[1]} />
                    ) : (
                      <div className="w-[320px] h-[190px] rounded-lg border-1 border-gray-400 border-dashed" />
                    )}
                  </div>
                </>
              ) : (
                <NotFound message="No cards." />
              )}
            </div>
          </div>

          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <h4>Budgets</h4>
              <button className="flex items-center gap-2">
                <span className="font-medium text-sm text-theme-d">
                  Manage Budgets
                </span>
              </button>
            </div>
            <div className="flex flex-col gap-3">
              {!budgetsLoading ? (
                budgetsEmpty(user?.budgets) ? (
                  <NotFound message="No budgets set." />
                ) : (
                  budgetCategories.map(
                    (item, index) =>
                      user?.budgets[item.name as Category] && (
                        <BudgetCard
                          key={index}
                          budget={{
                            ...item,
                            limit: user.budgets[item.name as Category],
                            spent: budgetsData?.getBudgetsSummary?.[item.name],
                          }}
                        />
                      )
                  )
                )
              ) : (
                Array.from({ length: 3 }).map((_, index) => (
                  <Skeleton className="h-[80px]" key={index} />
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Home;
