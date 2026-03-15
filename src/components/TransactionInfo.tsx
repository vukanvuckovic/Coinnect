import React from "react";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  capitalizeFirstLetter,
  formatAmount,
} from "../../utils/utils";

const TransactionInfo = ({
  children,
  transaction,
  loading,
}: {
  children: React.ReactNode;
  transaction: Transaction;
  loading: boolean;
}) => {
  const {
    id,
    sender,
    receiver,
    amount,
    createdAt,
    status,
    category,
    note,
    senderStatic,
    receiverStatic,
  } = transaction;
  return (
    !loading && (
      <Dialog>
        <DialogTrigger asChild>{children}</DialogTrigger>
        <DialogContent className="p-4 outline-none ring-0 ring-transparent border-none duration-200 max-h-[90dvh] overflow-y-scroll scrollbar-none">
          <DialogHeader hidden>
            <DialogTitle />
          </DialogHeader>
          <div className="flex flex-col gap-2">
            <div className="flex flex-col py-2">
              <h4>Transaction info</h4>
              <span className="heading-desc">{id}</span>
            </div>
            <div className="flex flex-col">
              <div className="transaction-info-section">
                <h3 className="payment-small-heading">Sender&apos;s name</h3>
                <span className="heading-desc">
                  {sender?.owner?.firstName ?? senderStatic?.firstName}{" "}
                  {sender?.owner?.lastName ?? senderStatic?.lastName}
                </span>
              </div>
              <div className="transaction-info-section">
                <h3 className="payment-small-heading">Sender&apos;s Account</h3>
                <span className="heading-desc">
                  {sender?.id ?? senderStatic?.accountId}
                </span>
              </div>
              <div className="transaction-info-section">
                <h3 className="payment-small-heading">Receiver&apos;s name</h3>
                <span className="heading-desc">
                  {receiver?.owner?.firstName ?? receiverStatic?.firstName}{" "}
                  {receiver?.owner?.lastName ?? receiverStatic?.lastName}
                </span>
              </div>
              <div className="transaction-info-section">
                <h3 className="payment-small-heading">
                  Receiver&apos;s Account
                </h3>
                <span className="heading-desc">
                  {receiver?.id ?? receiverStatic?.accountId}
                </span>
              </div>
              <div className="transaction-info-section">
                <h3 className="payment-small-heading">Amount</h3>
                <span className="heading-desc">{formatAmount(amount)}</span>
              </div>
              <div className="transaction-info-section">
                <h3 className="payment-small-heading">Date</h3>
                <span className="heading-desc">
                  {new Date(Number(createdAt)).toLocaleString("en-US", {
                    weekday: "short",
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                    hour: "numeric",
                    minute: "2-digit",
                    hour12: true,
                  })}
                </span>
              </div>
              <div className="transaction-info-section">
                <h3 className="payment-small-heading">Status</h3>
                <span className="heading-desc">
                  {capitalizeFirstLetter(status)}
                </span>
              </div>
              <div className="transaction-info-section">
                <h3 className="payment-small-heading">Category</h3>
                <span className="heading-desc">
                  {capitalizeFirstLetter(category)}
                </span>
              </div>
              {note && (
                <div className="flex flex-col gap-2 py-4 px-1">
                  <h3 className="payment-small-heading">
                    Note from{" "}
                    {sender?.owner?.firstName ?? senderStatic?.firstName}
                  </h3>
                  <span className="heading-desc">{note}</span>
                </div>
              )}
            </div>

            <DialogClose className="dialog-button">Done</DialogClose>
          </div>
        </DialogContent>
      </Dialog>
    )
  );
};

export default TransactionInfo;
