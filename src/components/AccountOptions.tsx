"use client";
import React, { useState } from "react";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { CreditCard, Trash } from "lucide-react";
import { toast } from "sonner";
import { gql, useMutation } from "@apollo/client";
import { useDispatch, useSelector } from "react-redux";
import {
  removeAccount,
  updateAccountDisabled,
} from "@/lib/features/user/userSlice";
import { useRouter } from "next/navigation";
import ConfirmDialog from "./ConfirmDialog";
import { RootState } from "@/lib/store";
import { refetchAccountsTransactionsCards } from "@/lib/features/helper/refetchHelperSlice";

const AccountOptions = ({
  children,
  refetchAccount,
  account,
}: {
  children: React.ReactNode;
  refetchAccount: () => void;
  account: Account;
}) => {
  const [dialog, setDialog] = useState(false);

  const SET_ACCOUNT_DISABLED = gql`
    mutation SetAccountDisabled($id: ID, $disabled: Boolean) {
      setAccountDisabled(id: $id, disabled: $disabled) {
        id
      }
    }
  `;

  const [setAccountDisabled] = useMutation(SET_ACCOUNT_DISABLED);

  const DELETE_ACCOUNT = gql`
    mutation DeleteAccount($id: ID, $userId: ID) {
      deleteAccount(id: $id, userId: $userId) {
        id
      }
    }
  `;

  const [deleteAccount] = useMutation(DELETE_ACCOUNT);

  const dispatch = useDispatch();
  const router = useRouter();

  const user = useSelector((state: RootState) => state.user.userInfo);

  if (!account) return;

  return (
    <Dialog
      open={dialog}
      onOpenChange={setDialog}
    >
      <DialogTrigger
        data-test="account-options"
        asChild
      >
        {children}
      </DialogTrigger>
      <DialogContent className="p-4 outline-none ring-0 ring-transparent border-none duration-200">
        <DialogHeader hidden>
          <DialogTitle />
        </DialogHeader>
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-2 p-2">
            <h4 className="leading-none">Account Options</h4>
            <span className="small-heading-desc leading-snug text-left">
              Choose what happens with this account.
            </span>
          </div>
          <ul className="flex flex-col gap-1">
            {!account.disabled ? (
              <li>
                <ConfirmDialog
                  onConfirm={async () => {
                    try {
                      const { data } = await setAccountDisabled({
                        variables: { id: account.id, disabled: true },
                      });
                      if (data.setAccountDisabled.id) {
                        toast.success("Successfully disabled this account!");
                        dispatch(
                          updateAccountDisabled({
                            accountId: data.setAccountDisabled.id,
                            disabled: true,
                          })
                        );
                        setDialog(false);
                        refetchAccount();
                      } else {
                        toast.error("Error disabling this account.");
                      }
                    } catch (error: unknown) {
                      toast.error(error instanceof Error ? error.message : "Unknown error");
                    }
                  }}
                  message="Are you sure you want to disable this account?"
                >
                  <button
                    data-test="disable-account"
                    className="w-full flex gap-3 outline-none py-4 pl-2 border-t-[1px] border-t-gray-200"
                  >
                    <CreditCard
                      size={14}
                      color={"var(--color-theme-d)"}
                    />
                    <div className="flex flex-col items-start gap-1">
                      <h5 className="leading-none">Disable account</h5>
                      <span className="small-heading-desc leading-snug text-left">
                        Useful in case of compromised data.
                      </span>
                    </div>
                  </button>
                </ConfirmDialog>
              </li>
            ) : (
              <li>
                <ConfirmDialog
                  onConfirm={async () => {
                    try {
                      const { data } = await setAccountDisabled({
                        variables: { id: account.id, disabled: false },
                      });
                      if (data.setAccountDisabled.id) {
                        toast.success("Successfully enabled this account!");
                        dispatch(
                          updateAccountDisabled({
                            accountId: data.setAccountDisabled.id,
                            disabled: false,
                          })
                        );
                        setDialog(false);
                        refetchAccount();
                      } else {
                        toast.error("Error enabling this account.");
                      }
                    } catch (error: unknown) {
                      toast.error(error instanceof Error ? error.message : "Unknown error");
                    }
                  }}
                  message="Are you sure you want to enable this account?"
                >
                  <button
                    data-test="enable-account"
                    className="w-full flex gap-3 outline-none py-4 pl-2 border-t-[1px] border-t-gray-200"
                  >
                    <CreditCard
                      size={14}
                      color={"var(--color-theme-d)"}
                      className="shrink-0"
                    />
                    <div className="flex flex-col items-start gap-1">
                      <h5 className="leading-none">Enable account</h5>
                      <span className="small-heading-desc leading-snug text-left">
                        Enable your previously disabled account.
                      </span>
                    </div>
                  </button>
                </ConfirmDialog>
              </li>
            )}
            <li>
              <ConfirmDialog
                onConfirm={async () => {
                  try {
                    const { data } = await deleteAccount({
                      variables: { id: account.id, userId: user?.id },
                    });
                    if (data.deleteAccount.id) {
                      toast.success("Account removed.");
                      dispatch(
                        removeAccount({ accountId: data.deleteAccount.id })
                      );
                      router.push("/accounts");
                      dispatch(refetchAccountsTransactionsCards());
                      setDialog(false);
                    } else {
                      toast.error("Failed to remove account.");
                    }
                  } catch (error: unknown) {
                    toast.error(error instanceof Error ? error.message : "Unknown error");
                  }
                }}
                message="Are you sure you want to remove this account? This action cannot be undone, and it will remove the attached card if this is the only account on it."
              >
                <button className="w-full flex gap-3 outline-none py-4 pl-2 border-t-[1px] border-t-gray-200">
                  <Trash
                    size={14}
                    color="red"
                    className="shrink-0"
                  />
                  <div className="flex flex-col items-start gap-1">
                    <h5 className="leading-none">Remove account</h5>
                    <span className="small-heading-desc leading-snug text-left">
                      Completely disable and remove this account along with the
                      cards connected (if this is the only account on the card).
                    </span>
                  </div>
                </button>
              </ConfirmDialog>
            </li>
          </ul>
          <DialogClose className="dialog-button">Done</DialogClose>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AccountOptions;
