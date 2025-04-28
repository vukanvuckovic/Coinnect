import { RootState } from "@/lib/store";
import { gql, useMutation, useQuery } from "@apollo/client";
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import UniSelect from "./UniSelect";
import { CreditCard, DollarSign, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { addAccount } from "@/lib/features/user/userSlice";
import { refetchAccountsTransactionsCards } from "@/lib/features/helper/refetchHelperSlice";
import { Skeleton } from "./ui/skeleton";

const RegisterAccount = ({ children }: { children: React.ReactNode }) => {
  const [open, setOpen] = useState(false);
  const [accountType, setAccountType] = useState<string>();
  const [existingCard, setExistingCard] = useState<string>();
  const [coOwner, setCoOwner] = useState("");
  const [pin, setPin] = useState("");

  const CREATE_ACCOUNT = gql`
    mutation CreateAccount($accountInfo: AccountInput) {
      createAccount(accountInfo: $accountInfo) {
        id
        type
        balance
        interest
        disabled
        accountName
        cardNumber
      }
    }
  `;

  const [createAccount, { loading: createAccountLoading }] =
    useMutation(CREATE_ACCOUNT);

  const dispatch = useDispatch();

  const user = useSelector((state: RootState) => state.user.userInfo);

  const GET_CARDS = gql`
    query GetCards($userId: ID) {
      getCards(userId: $userId) {
        id
      }
    }
  `;

  const {
    data: cardsData,
    error: cardsError,
    loading: cardsLoading,
  } = useQuery(GET_CARDS, { variables: { userId: user?.id } });

  useEffect(() => {
    if (cardsError) {
      toast.error("Error getting cards", {
        description: cardsError.message,
      });
    }
  }, [cardsError]);

  return (
    <Dialog
      open={open}
      onOpenChange={setOpen}
    >
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="p-4 outline-none ring-0 ring-transparent border-none duration-200 max-h-[90dvh] overflow-y-scroll scrollbar-none">
        <DialogHeader hidden>
          <DialogTitle />
        </DialogHeader>
        <div className="flex flex-col">
          <div className="flex flex-col py-2">
            <h4>Register an Account</h4>
            <span className="heading-desc">
              Create an account without showing up in person.
            </span>
          </div>
          <div className="flex flex-col gap-2">
            <div className="account-dialog-section flex flex-col gap-4">
              <div className="flex flex-col gap-1">
                <h5>Account type</h5>
                <span className="small-heading-desc">
                  What type of account would you like to get?
                </span>
              </div>
              <UniSelect
                value={accountType}
                setValue={setAccountType}
                icon={
                  <DollarSign
                    size={16}
                    color={"var(--color-theme-d)"}
                  />
                }
                placeholder="Select a type"
                options={[
                  { value: "checking", title: "Checking" },
                  { value: "savings", title: "Savings" },
                  { value: "credit", title: "Credit" },
                  { value: "joint", title: "Joint" },
                  { value: "business", title: "Business" },
                ]}
              />
              {accountType === "joint" && (
                <div className="flex flex-col gap-2">
                  <div className="flex flex-col gap-1">
                    <h5>Account Co-Owner</h5>
                    <span className="small-heading-desc">
                      Enter the email of this account&apos;s co-owner
                    </span>
                  </div>
                  <input
                    type="email"
                    placeholder="johndoe@example.com"
                    className="payment-input"
                    value={coOwner}
                    onChange={(e) => setCoOwner(e.target.value)}
                  />
                </div>
              )}
            </div>
            <div className="account-dialog-section flex flex-col gap-4">
              <div className="flex flex-col gap-1">
                <h5>Card (optional)</h5>
                <span className="small-heading-desc">
                  You can link this account to an existing card to avoid getting
                  extra ones.
                </span>
              </div>
              {cardsLoading ? (
                <Skeleton className="h-[40px] w-[200px]" />
              ) : (
                <UniSelect
                  value={existingCard}
                  setValue={setExistingCard}
                  icon={
                    <CreditCard
                      size={16}
                      color={"var(--color-theme-d)"}
                    />
                  }
                  placeholder="Choose an existing card"
                  options={
                    cardsData?.getCards?.map((item: { id: string }) => ({
                      value: item.id,
                      title: item.id,
                    })) ?? [
                      {
                        value: undefined,
                        title: "No cards available",
                      },
                    ]
                  }
                />
              )}
              {!existingCard && (
                <>
                  <div className="flex flex-col mt-2">
                    <h5>PIN for a new card</h5>
                    <span className="small-heading-desc">
                      If you are not going to connect your new account to an
                      existing card, choose a PIN for the new card that your new
                      account is going to be connected to.
                    </span>
                  </div>
                  <input
                    type="number"
                    placeholder="1234"
                    className="payment-input no-spinner"
                    value={pin}
                    onChange={(e) => setPin(e.target.value)}
                  />
                </>
              )}
            </div>
            <button
              onClick={async () => {
                try {
                  const { data } = await createAccount({
                    variables: {
                      accountInfo: {
                        owner: user?.id,
                        type: accountType,
                        cardNumber: existingCard,
                        pin: Number(pin),
                        coOwner: coOwner,
                      },
                    },
                  });
                  if (data.createAccount.id) {
                    toast.success("Account registered successfully!");
                    dispatch(refetchAccountsTransactionsCards());
                    dispatch(addAccount({ account: data.createAccount }));
                  } else {
                    toast.error("Account registration failed.");
                  }
                  setOpen(false);
                } catch (error: unknown) {
                  toast.error("Error creating account", {
                    description: error instanceof Error ? error.message : "Unknown error",
                  });
                }
              }}
              className="dialog-button flex justify-center items-center gap-2"
            >
              {createAccountLoading
                ? "Applying for Account..."
                : "Apply for Account"}
              {createAccountLoading && (
                <Loader2
                  color="white"
                  size={16}
                  className="animate-spin"
                />
              )}
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default RegisterAccount;
