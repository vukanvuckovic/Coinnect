"use client";
import AccountCard from "@/components/AccountCard";
import { BalanceChart } from "@/components/BalanceChart";
import TransactionsTable from "@/components/TransactionsTable";
import UniSelect from "@/components/UniSelect";
import { RootState } from "@/lib/store";
import { gql, useQuery } from "@apollo/client";
import { CreditCard, Filter, Settings } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Skeleton } from "@/components/ui/skeleton";
import AccountOptions from "@/components/AccountOptions";
import { setLoading } from "@/lib/features/loader/loaderSlice";
import { toast } from "sonner";
import { filterTransactions } from "../../../../../utils/utils";
import { GET_MONTHLY_SPENDING_RECAP } from "@/lib/queries";

const GET_ACCOUNTS_IDS = gql`
  query GetAccounts($userId: ID) {
    getAccounts(userId: $userId) {
      id
    }
  }
`;

const GET_ACCOUNT = gql`
  query GetAccount($id: ID) {
    getAccount(id: $id) {
      id
      type
      balance
      disabled
    }
  }
`;

const GET_TRANSACTIONS = gql`
  query GetTransactions($accountId: ID, $limit: Int, $userId: ID) {
    getTransactions(accountId: $accountId, limit: $limit, userId: $userId) {
      transactions {
        id
        sender {
          id
          owner {
            firstName
          }
        }
        receiver {
          id
          owner {
            firstName
          }
        }
        senderStatic {
          ...StaticFragment
        }
        receiverStatic {
          ...StaticFragment
        }
        amount
        note
        status
        category
        createdAt
      }
      hasMore
    }
  }

  fragment StaticFragment on UserStatic {
    firstName
    lastName
    accountId
    email
  }
`;

const Account = () => {
  const params = useParams();
  const id = params.id as string;

  const [limit, setLimit] = useState(5);
  const [filter, setFilter] = useState<string>();
  const [filteredTransactions, setFilteredTransactions] =
    useState<Transaction[]>();
  const [accountId, setAccountId] = useState<string | undefined>(id);

  const user = useSelector((state: RootState) => state.user.userInfo);
  const router = useRouter();
  const dispatch = useDispatch();

  const {
    data: accountsData,
    loading: accountsLoading,
    error: accountsError,
  } = useQuery(GET_ACCOUNTS_IDS, { variables: { userId: user?.id } });

  const {
    data: accountData,
    error: accountDataError,
    loading: accountLoading,
    refetch: refetchAccount,
  } = useQuery(GET_ACCOUNT, { variables: { id } });

  const {
    data: transactionsData,
    loading: transactionsLoading,
    error: getTransactionsError,
  } = useQuery(GET_TRANSACTIONS, {
    variables: { accountId: id, limit, userId: user?.id },
  });

  const {
    data: reportData,
    loading: reportLoading,
    error: reportError,
  } = useQuery(GET_MONTHLY_SPENDING_RECAP, {
    variables: { accountIds: [id], userId: user?.id },
  });

  useEffect(() => {
    if (reportError) toast.error("Error loading spending data.", { description: reportError.message });
    if (getTransactionsError) toast.error("Error loading transactions.", { description: getTransactionsError.message });
    if (accountDataError) toast.error("Error loading account.", { description: accountDataError.message });
    if (accountsError) toast.error("Error loading account options.", { description: accountsError.message });
  }, [reportError, getTransactionsError, accountDataError, accountsError]);

  useEffect(() => {
    dispatch(setLoading(accountLoading));
    if (!accountLoading && !accountData?.getAccount) {
      router.push("/accounts");
    }
  }, [accountData, accountLoading]);

  useEffect(() => {
    if (!transactionsLoading && transactionsData?.getTransactions && filter) {
      const trx = filterTransactions(
        filter,
        transactionsData.getTransactions.transactions ?? []
      );
      setFilteredTransactions(trx);
    }
  }, [filter, transactionsData?.getTransactions, transactionsLoading]);

  if (accountLoading || !accountData?.getAccount) return null;

  return (
    <div className="flex-1 flex flex-col gap-6 max-md:px-3 px-6 max-md:py-6 py-8 min-w-0">
      <div className="flex flex-wrap justify-between gap-4">
        <div className="max-md:order-2 flex flex-col">
          <h4>Account {id}</h4>
          <span className="heading-desc">
            Manage your transactions effectively
          </span>
        </div>
        <div className="max-md:order-1 flex max-md:w-full max-md:justify-between items-center gap-4">
          <AccountOptions refetchAccount={refetchAccount} account={accountData.getAccount}>
            <Settings
              size={20}
              color="gray"
              className="max-md:order-2 hover:rotate-45 duration-200 cursor-pointer"
            />
          </AccountOptions>
          {accountsLoading ? (
            <Skeleton className="max-md:order-1 h-[40px] w-[200px]" />
          ) : (
            <UniSelect<string>
              className="max-md:order-1 w-fit min-w-[200px] text-xs"
              value={accountId}
              setValue={setAccountId}
              placeholder="Select account"
              options={
                accountsData?.getAccounts?.map((item: Account) => ({
                  value: item.id,
                  title: item.id,
                })) ?? []
              }
              icon={<CreditCard size={16} color="var(--color-theme-d)" />}
              onChange={(id) => router.push(`/accounts/${id}`)}
            />
          )}
        </div>
      </div>

      <AccountCard account={accountData.getAccount} />

      {reportLoading ? (
        <Skeleton className="h-[300px] w-full" />
      ) : (
        <BalanceChart
          noTransactions={
            transactionsData?.getTransactions?.transactions?.length === 0
          }
          monthlyRecap={reportData?.getMonthlySpendingRecap ?? []}
        />
      )}

      <div className="flex items-center justify-between">
        <h5>Transaction history</h5>
        <UniSelect
          className="w-fit"
          value={filter}
          setValue={setFilter}
          icon={<Filter size={14} color="gray" />}
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
      </div>

      <TransactionsTable
        transactions={
          filteredTransactions ??
          transactionsData?.getTransactions?.transactions ??
          []
        }
        loading={transactionsLoading}
        hasMore={transactionsData?.getTransactions?.hasMore}
        setLimit={setLimit}
        limit={limit}
        accountIds={[id as string]}
      />
    </div>
  );
};

export default Account;
