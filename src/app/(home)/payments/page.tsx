"use client";
import UniSelect from "@/components/UniSelect";
import { budgetCategories } from "@/constants/data";
import { RootState } from "@/lib/store";
import { gql, useMutation, useQuery } from "@apollo/client";
import { CreditCard, Download, Folder, Loader2, PersonStanding } from "lucide-react";
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "sonner";
import { capitalizeFirstLetter } from "../../../../utils/utils";
import { addTemplate } from "@/lib/features/user/userSlice";
import { Skeleton } from "@/components/ui/skeleton";
import { refetchAccountsTransactionsCards } from "@/lib/features/helper/refetchHelperSlice";
import { GET_ACCOUNTS, CREATE_TEMPLATE } from "@/lib/queries";
import { useRefetchOnAccountsChange } from "@/hooks/useRefetchTrigger";
import PaymentField from "@/components/PaymentField";
import PageHeader from "@/components/PageHeader";

const CREATE_TRANSACTION = gql`
  mutation CreateTransaction($transactionInfo: TransactionInput) {
    createTransaction(transactionInfo: $transactionInfo) {
      id
    }
  }
`;

const Payments = () => {
  const [paymentSourceAccount, setPaymentSourceAccount] = useState<string>();
  const [templateValue, setTemplateValue] = useState<Template>();
  const [note, setNote] = useState("");
  const [recipientInfo, setRecipientInfo] = useState({
    name: "",
    receiverEmail: "",
    receiver: "",
    amount: "",
  });
  const [category, setCategory] = useState<Category>();

  const user = useSelector((state: RootState) => state.user.userInfo);
  const dispatch = useDispatch();

  const [createTransaction, { loading: transactionLoading }] =
    useMutation(CREATE_TRANSACTION);
  const [createTemplate, { loading: templateLoading }] =
    useMutation(CREATE_TEMPLATE);

  const {
    data: accountsData,
    loading: accountsLoading,
    error: accountsError,
    refetch: refetchAccounts,
  } = useQuery(GET_ACCOUNTS, { variables: { userId: user?.id } });

  useEffect(() => {
    if (accountsError) {
      toast.error("Error loading accounts", {
        description: accountsError.message,
      });
    }
  }, [accountsError]);

  useRefetchOnAccountsChange(refetchAccounts);

  const handleSaveTemplate = async () => {
    try {
      const { data } = await createTemplate({
        variables: {
          templateInfo: {
            userId: user?.id,
            receiverName: recipientInfo.name,
            receiverEmail: recipientInfo.receiverEmail,
            receiverAccount: recipientInfo.receiver,
          },
        },
      });
      if (data?.createTemplate?.receiverEmail) {
        toast.success("Template saved successfully!", {
          description: data.createTemplate.receiverEmail,
        });
        dispatch(addTemplate({ template: data.createTemplate }));
      } else {
        toast.error("Template creation failed.");
      }
    } catch (error: unknown) {
      toast.error("Error creating template", {
        description: error instanceof Error ? error.message : "Unknown error",
      });
    }
  };

  const handleTransfer = async () => {
    try {
      const { data } = await createTransaction({
        variables: {
          transactionInfo: {
            receiverEmail: recipientInfo.receiverEmail,
            senderEmail: user?.email,
            receiver: recipientInfo.receiver,
            sender: paymentSourceAccount,
            amount: Number(recipientInfo.amount),
            note,
            category,
            currentUserId: user?.id,
          },
        },
      });
      if (data?.createTransaction?.id) {
        toast.success("Transaction completed");
        dispatch(refetchAccountsTransactionsCards());
      } else {
        toast.error("Transaction failed.", { description: "Try again." });
      }
    } catch (error: unknown) {
      toast.error("Transaction failed.", {
        description: error instanceof Error ? error.message : "Unknown error",
      });
    }
  };

  const handleRecipientChange =
    (field: keyof typeof recipientInfo) =>
    (e: React.ChangeEvent<HTMLInputElement>) =>
      setRecipientInfo((prev) => ({ ...prev, [field]: e.target.value }));

  const accountOptions =
    accountsData?.getAccounts
      ?.filter((item: Account) => !item.disabled)
      .map((item: Account) => ({
        value: item.id,
        title: `${item.accountName} - ${capitalizeFirstLetter(item.type)}`,
      })) ?? [];

  return (
    <div className="flex-1 flex flex-col gap-6 max-md:px-3 px-6 max-md:py-6 py-8">
      <PageHeader
        title="My Payments"
        description="Effortlessly Manage Your Banking Payments"
      />
      <div className="flex flex-col">
        <div className="flex flex-col payment-section">
          <h5>Transfer Details</h5>
          <span className="small-heading-desc">
            Enter the details of a recipient
          </span>
        </div>

        <PaymentField
          label="Select Source Account"
          description="Select the bank account you want to transfer funds from"
        >
          {accountsLoading ? (
            <Skeleton className="h-[40px] w-[200px]" />
          ) : (
            <UniSelect
              dataTestTrigger="account-selector-trigger"
              dataTestOption="account-selector-option"
              className="w-full md:w-fit"
              value={paymentSourceAccount}
              setValue={setPaymentSourceAccount}
              icon={<CreditCard size={16} color={"var(--color-theme-d)"} />}
              placeholder="Select an account"
              options={accountOptions}
            />
          )}
        </PaymentField>

        <div className="flex flex-col payment-section">
          <div className="flex max-md:flex-col max-md:gap-4 gap-16 max-w-[800px]">
            <div className="flex flex-col gap-1 md:w-[30%]">
              <h3 className="payment-small-heading">
                Transfer note (optional)
              </h3>
              <span className="payment-text">
                Please provide any additional information or instructions
                related to the transfer
              </span>
            </div>
            <div className="flex-1 flex">
              <textarea
                className="flex-1 border-[1px] border-gray-200 px-3 py-2 rounded-md placeholder:text-sm shadow-sm shadow-gray-100 outline-none"
                placeholder="Leave a message for the recipient."
                rows={4}
                value={note}
                onChange={(e) => setNote(e.target.value)}
              />
            </div>
          </div>
        </div>

        <div className="payment-section">
          <div className="flex max-md:flex-col md:items-center justify-between gap-4 w-full max-w-[800px]">
            <div className="flex flex-col">
              <h3 className="small-heading">Bank Account Details</h3>
              <span className="small-heading-desc">
                Enter the bank account details of a recipient
              </span>
            </div>
            <UniSelect
              dataTestTrigger="template-selector-trigger"
              dataTestOption="template-selector-option"
              className="w-full md:w-fit"
              value={templateValue}
              setValue={setTemplateValue}
              onChange={(v: Template) =>
                setRecipientInfo((prev) => ({
                  ...prev,
                  receiverEmail: v.receiverEmail,
                  receiver: v.receiverAccount,
                  name: v.receiverName,
                }))
              }
              placeholder="Select a template"
              icon={<PersonStanding size={18} color="gray" />}
              options={
                user?.templates?.map((item) => ({
                  value: item,
                  title: item.receiverName,
                })) ?? []
              }
            />
          </div>
        </div>

        <PaymentField label="Recipient's name">
          <input
            data-test="recipient-name"
            type="text"
            className="payment-input"
            placeholder="John Doe"
            onChange={handleRecipientChange("name")}
            value={recipientInfo.name}
          />
        </PaymentField>

        <PaymentField label="Recipient's email address">
          <input
            data-test="recipient-email"
            type="email"
            className="payment-input"
            placeholder="johndoe@example.com"
            onChange={handleRecipientChange("receiverEmail")}
            value={recipientInfo.receiverEmail}
          />
        </PaymentField>

        <PaymentField label="Recipient's Bank Account Number">
          <input
            data-test="recipient-account"
            type="text"
            className="payment-input"
            placeholder="1234 1234 1234 1234"
            onChange={handleRecipientChange("receiver")}
            value={recipientInfo.receiver}
          />
        </PaymentField>

        <PaymentField label="Save recipient as a template?">
          <button
            data-test="save-template"
            onClick={handleSaveTemplate}
            className="flex-1 flex items-center justify-center gap-2 border-[1px] border-gray-200 rounded-sm px-3 py-2 shadow-sm shadow-gray-100 text-sm"
          >
            <span className="text-theme-d">
              {templateLoading ? "Saving..." : "Save"}
            </span>
            <Download size={14} color="var(--color-theme-d)" />
          </button>
        </PaymentField>

        <PaymentField label="Amount">
          <input
            data-test="transfer-amount"
            type="number"
            className="payment-input"
            placeholder="100"
            onChange={handleRecipientChange("amount")}
            value={recipientInfo.amount}
          />
        </PaymentField>

        <PaymentField
          label="Category (optional)"
          description="You can provide the category of this payment for clarity, filtering and budget tracking. The category cannot be changed later."
        >
          <UniSelect
            dataTestTrigger="category-selector-trigger"
            dataTestOption="category-selector-option"
            value={category}
            setValue={setCategory}
            icon={<Folder size={12} color="var(--color-theme-d)" />}
            placeholder="Select a category"
            options={budgetCategories.map((item) => ({
              title: capitalizeFirstLetter(item.name),
              value: item.name,
            }))}
          />
        </PaymentField>

        <button
          data-test="payment-button"
          disabled={!paymentSourceAccount || recipientInfo.receiver === ""}
          onClick={handleTransfer}
          className="flex items-center justify-center gap-2 max-w-[800px] h-[40px] rounded-md bg-theme-d text-white font-semibold my-6 disabled:opacity-80"
        >
          Transfer Funds
          {transactionLoading && (
            <Loader2 size={16} color="white" className="animate-spin" />
          )}
        </button>
      </div>
    </div>
  );
};

export default Payments;
