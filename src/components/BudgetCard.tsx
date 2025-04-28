import React, { useState } from "react";
import { capitalizeFirstLetter } from "../../utils/utils";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";
import { gql, useMutation } from "@apollo/client";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/lib/store";
import { toast } from "sonner";
import {
  colorMap200,
  colorMap50,
  colorMap600,
  colorMap700,
} from "@/constants/data";
import { updateBudget } from "@/lib/features/user/userSlice";

const BudgetForm = ({
  budget,
  children,
  disabled = false,
}: {
  budget: {
    name: string;
    color: string;
    limit?: number;
  };
  children: React.ReactNode;
  disabled?: boolean;
}) => {
  const [open, setOpen] = useState(false);
  const [budgetLimit, setBudgetLimit] = useState(budget.limit ?? "");

  const SET_BUDGET = gql`
    mutation SetBudget($budgetInfo: BudgetInput) {
      setBudget(budgetInfo: $budgetInfo)
    }
  `;

  const [setBudget] = useMutation(SET_BUDGET);

  const user = useSelector((state: RootState) => state.user.userInfo);

  const dispatch = useDispatch();

  return (
    <Dialog
      open={open}
      onOpenChange={setOpen}
    >
      <DialogTrigger
        disabled={disabled}
        asChild
      >
        {children}
      </DialogTrigger>
      <DialogContent className="p-4 outline-none ring-0 ring-transparent border-none duration-200 max-h-[90dvh] overflow-y-scroll">
        <DialogHeader hidden>
          <DialogTitle />
        </DialogHeader>
        <div className="flex flex-col gap-4">
          <div className="flex flex-col py-2">
            <h5>Set Budget</h5>
            <span className="small-heading-desc">
              Set the desired budget for {budget.name} transactions.
            </span>
          </div>
          <input
            data-test="budget-input"
            type="number"
            placeholder="$120"
            className="payment-input no-spinner"
            value={budgetLimit}
            onChange={(e) => setBudgetLimit(e.target.value)}
          />
          <div className="flex gap-2">
            <button
              data-test="remove-budget"
              onClick={async () => {
                const { data } = await setBudget({
                  variables: {
                    budgetInfo: {
                      budget: budget.name,
                      value: undefined,
                      userId: user?.id,
                    },
                  },
                });
                if (data.setBudget) {
                  toast.success("Budget removed successfully!");
                  dispatch(
                    updateBudget({ name: budget.name, budget: undefined })
                  );
                } else {
                  toast.error("Error removing budget.");
                }
                setOpen(false);
              }}
              className="flex-1 dialog-button !bg-gray-100 !text-theme-gray-dark-2 !font-normal"
            >
              Remove budget
            </button>
            <button
              data-test="set-budget"
              onClick={async () => {
                try {
                  const { data } = await setBudget({
                    variables: {
                      budgetInfo: {
                        budget: budget.name,
                        value: Number(budgetLimit),
                        userId: user?.id,
                      },
                    },
                  });
                  if (data.setBudget) {
                    toast.success("Budget set successfully!");
                    dispatch(
                      updateBudget({
                        name: budget.name,
                        budget: Number(budgetLimit),
                      })
                    );
                  } else {
                    toast.error("Error setting budget.");
                  }
                } catch (error: unknown) {
                  toast.error("Error setting budget.", {
                    description: error instanceof Error ? error.message : "Unknown error",
                  });
                }
                setOpen(false);
              }}
              className="flex-1 dialog-button"
            >
              Set budget
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

const BudgetCard = ({
  budget,
  dashboard = false,
}: {
  budget: {
    name: string;
    color: string;
    spent?: number;
    limit?: number;
    icon: React.ReactNode;
  };
  dashboard?: boolean;
}) => {
  let left;

  if (budget.limit) {
    left = budget.limit - (budget.spent ?? 0);
  }

  return (
    <BudgetForm
      disabled={dashboard}
      budget={budget}
    >
      <div
        data-test="budget-card"
        className={`flex items-center gap-4 p-3 h-[80px] w-full rounded-lg ${
          colorMap50[budget.color as keyof typeof colorMap50]
        } ${dashboard ? "hover:scale-101 cursor-pointer" : ""} duration-200`}
      >
        <div
          className={`h-full aspect-square rounded-full flex justify-center items-center ${
            colorMap200[budget.color as keyof typeof colorMap200]
          }`}
        >
          {budget.icon}
        </div>
        <div className="flex-1 flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <span
              className={`text-sm font-medium ${
                colorMap700[budget.color as keyof typeof colorMap700]
              }`}
            >
              {capitalizeFirstLetter(budget.name)}
            </span>
            <span
              className={`text-sm font-medium ${
                colorMap700[budget.color as keyof typeof colorMap700]
              }`}
            >
              {budget.limit &&
                left &&
                (left >= 0 ? `$${left} left` : `$${Math.abs(left)} over`)}
            </span>
          </div>
          <div className="flex flex-col gap-1">
            <div
              className={`h-1 rounded-full overflow-hidden ${
                colorMap200[budget.color as keyof typeof colorMap200]
              }`}
            >
              <div
                className={`h-full rounded-sm ${
                  colorMap600[budget.color as keyof typeof colorMap600]
                }`}
                style={{
                  width:
                    budget.spent && budget.limit
                      ? `${(budget.spent / budget.limit) * 100}%`
                      : "0%",
                }}
              />
            </div>
            <div className="flex items-center justify-between">
              <span
                className={`text-xs ${
                  colorMap700[budget.color as keyof typeof colorMap700]
                }`}
              >
                ${budget.spent ?? 0}
              </span>
              <span
                className={`text-xs ${
                  colorMap700[budget.color as keyof typeof colorMap700]
                }`}
              >
                {!budget.limit ? "No budget" : `$${budget.limit}`}
              </span>
            </div>
          </div>
        </div>
      </div>
    </BudgetForm>
  );
};

export default BudgetCard;
