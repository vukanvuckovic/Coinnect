import React from "react";
import {
  capitalizeFirstLetter,
  formatAccountNumber,
  formatAmount,
} from "../../utils/utils";
import { useParams, useRouter } from "next/navigation";
import { accountColors } from "@/constants/data";

const AccountCard = ({ account }: { account: Account }) => {
  const router = useRouter();
  const params = useParams();
  const id = params.id;
  return (
    <button
      data-test="account-card"
      style={{
        backgroundColor: accountColors[account.type as Accounts],
        opacity: account.disabled ? 0.6 : 1,
      }}
      disabled={id === account.id}
      onClick={() => router.push(`/accounts/${account.id}`)}
      className="flex flex-wrap gap-6 items-center justify-between max-md:p-4 p-6 rounded-md text-white"
    >
      <div className="shrink-0 flex-1 flex flex-col items-start max-md:gap-1 gap-2">
        <h4>Coinnect</h4>
        <h5>
          Coinnect {capitalizeFirstLetter(account.type)} Account
        </h5>
        <span className="max-md:text-sm tracking-widest font-medium">
          {formatAccountNumber(account.id)}
        </span>
      </div>
      <div className="shrink-0 max-md:flex-1 flex flex-col gap-1 max-md:px-4 px-6 max-md:py-4 py-5 bg-white/15 rounded-md border-[1px] border-white/30">
        <span className="font-medium max-md:text-xs text-sm">Current balance</span>
        <span className="font-bold max-md:text-lg text-xl">
          {formatAmount(account.balance)}
        </span>
      </div>
    </button>
  );
};

export default AccountCard;
