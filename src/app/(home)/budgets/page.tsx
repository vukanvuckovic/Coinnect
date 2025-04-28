"use client";
import React, { useEffect } from "react";
import BudgetCard from "@/components/BudgetCard";
import { budgetCategories } from "@/constants/data";
import { useSelector } from "react-redux";
import { RootState } from "@/lib/store";
import { useQuery } from "@apollo/client";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";
import { GET_BUDGETS_SUMMARY } from "@/lib/queries";
import { useRefetchOnAccountsChange } from "@/hooks/useRefetchTrigger";
import PageHeader from "@/components/PageHeader";

const Budgets = () => {
  const user = useSelector((state: RootState) => state.user.userInfo);

  const {
    data: budgetsData,
    loading: budgetsLoading,
    error: budgetsError,
    refetch: budgetsRefetch,
  } = useQuery(GET_BUDGETS_SUMMARY, { variables: { ownerId: user?.id } });

  useEffect(() => {
    if (budgetsError) {
      toast.error("Error loading budgets", { description: budgetsError.message });
    }
  }, [budgetsError]);

  useRefetchOnAccountsChange(budgetsRefetch);

  return (
    <div className="flex-1 flex flex-col gap-6 max-md:px-3 px-6 max-md:py-6 py-8">
      <PageHeader
        title="My Budgets"
        description="Manage your Budgets here"
      />
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
        {budgetsLoading
          ? Array.from({ length: 5 }).map((_, index) => (
              <Skeleton className="h-[80px]" key={index} />
            ))
          : budgetCategories.map((item, index) => (
              <BudgetCard
                key={index}
                budget={{
                  ...item,
                  limit: user?.budgets[item.name as Category],
                  spent: budgetsData?.getBudgetsSummary?.[item.name],
                }}
              />
            ))}
      </div>
    </div>
  );
};

export default Budgets;
