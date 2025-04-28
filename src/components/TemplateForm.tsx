"use client";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import React from "react";
import { useMutation } from "@apollo/client";
import { gql } from "@apollo/client";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/lib/store";
import { toast } from "sonner";
import { addTemplate, updateTemplate } from "@/lib/features/user/userSlice";
import { CREATE_TEMPLATE } from "@/lib/queries";
import { useState } from "react";

const EDIT_TEMPLATE = gql`
  mutation EditTemplate($templateInfo: EditTemplateInput) {
    editTemplate(templateInfo: $templateInfo) {
      receiverEmail
    }
  }
`;

const TemplateForm = ({
  children,
  open,
  setOpen,
  templateInfo,
  edit = false,
}: {
  children?: React.ReactNode;
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  templateInfo?: Template;
  edit?: boolean;
}) => {
  const [template, setTemplate] = useState(
    edit && templateInfo
      ? {
          id: templateInfo.id,
          receiverName: templateInfo.receiverName,
          receiverEmail: templateInfo.receiverEmail,
          receiverAccount: templateInfo.receiverAccount,
        }
      : {
          id: "",
          receiverName: "",
          receiverEmail: "",
          receiverAccount: "",
        }
  );

  const [createTemplate, { loading: createLoading }] =
    useMutation(CREATE_TEMPLATE);
  const [editTemplate, { loading: editLoading }] = useMutation(EDIT_TEMPLATE);

  const user = useSelector((state: RootState) => state.user.userInfo);
  const dispatch = useDispatch();

  const handleChange =
    (field: keyof typeof template) =>
    (e: React.ChangeEvent<HTMLInputElement>) =>
      setTemplate((prev) => ({ ...prev, [field]: e.target.value }));

  const handleCreate = async () => {
    try {
      const { data } = await createTemplate({
        variables: {
          templateInfo: {
            userId: user?.id,
            receiverName: template.receiverName,
            receiverEmail: template.receiverEmail,
            receiverAccount: template.receiverAccount,
          },
        },
      });
      if (data.createTemplate.receiverEmail) {
        toast.success("Template created successfully!", {
          description: data.createTemplate.receiverEmail,
        });
        dispatch(addTemplate({ template: data.createTemplate }));
        setOpen(false);
      }
    } catch (error: unknown) {
      toast.error("Error creating template.", {
        description: error instanceof Error ? error.message : "Unknown error",
      });
    }
  };

  const handleEdit = async () => {
    try {
      const { data } = await editTemplate({
        variables: {
          templateInfo: {
            userId: user?.id,
            templateId: template.id,
            receiverName: template.receiverName,
            receiverEmail: template.receiverEmail,
            receiverAccount: template.receiverAccount,
          },
        },
      });
      if (data.editTemplate.receiverEmail) {
        toast.success("Template edited successfully!", {
          description: data.editTemplate.receiverEmail,
        });
        dispatch(updateTemplate({ template }));
        setOpen(false);
      } else {
        toast.error("Template edit failed.", { description: "Try again." });
      }
    } catch (error: unknown) {
      toast.error("Editing template failed.", {
        description: error instanceof Error ? error.message : "Unknown error",
      });
    }
  };

  const isLoading = edit ? editLoading : createLoading;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="p-4 outline-none ring-0 ring-transparent border-none duration-200">
        <DialogHeader hidden>
          <DialogTitle />
        </DialogHeader>
        <div className="flex flex-col gap-6">
          <div className="flex flex-col">
            <h4>{edit ? "Edit template" : "Add new template"}</h4>
            <span className="max-md:text-xs text-sm">
              Save the details to make your repetitive payments faster.
            </span>
          </div>
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-1">
              <span className="small-heading-desc">Recipient&apos;s name</span>
              <input
                data-test="recipient-name"
                value={template.receiverName}
                onChange={handleChange("receiverName")}
                type="text"
                className="payment-input"
                placeholder="John Doe"
              />
            </div>
            <div className="flex flex-col gap-1">
              <span className="small-heading-desc">
                Recipient&apos;s email
              </span>
              <input
                data-test="recipient-email"
                value={template.receiverEmail}
                onChange={handleChange("receiverEmail")}
                type="email"
                className="payment-input"
                placeholder="john@example.com"
              />
            </div>
            <div className="flex flex-col gap-1">
              <span className="small-heading-desc">
                Recipient&apos;s account number
              </span>
              <input
                data-test="recipient-account"
                value={template.receiverAccount}
                onChange={handleChange("receiverAccount")}
                type="text"
                className="payment-input no-spinner"
                placeholder="12-123123123-12"
              />
            </div>
          </div>
          <button
            data-test="confirm-template"
            onClick={edit ? handleEdit : handleCreate}
            className="dialog-button"
            disabled={isLoading}
          >
            {edit
              ? isLoading
                ? "Editing template..."
                : "Edit template"
              : isLoading
              ? "Saving template..."
              : "Save template"}
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default TemplateForm;
