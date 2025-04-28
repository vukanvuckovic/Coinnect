import { Edit, EllipsisVertical, PersonStanding, Trash } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import React, { useContext, useState } from "react";
import { gql, useMutation } from "@apollo/client";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/lib/store";
import { toast } from "sonner";
import ConfirmDialog from "./ConfirmDialog";
import { removeTemplate } from "@/lib/features/user/userSlice";
import { TemplateContext } from "@/context/TemplateContext";

const TemplateMenu = ({ children }: { children: React.ReactNode }) => {
  const [menu, setMenu] = useState(false);
  const [confirmDialog, setConfirmDialog] = useState(false);

  const DELETE_TEMPLATE = gql`
    mutation DeleteTemplate($templateId: ID, $userId: ID) {
      deleteTemplate(templateId: $templateId, userId: $userId) {
        receiverEmail
      }
    }
  `;

  const [deleteTemplate] = useMutation(DELETE_TEMPLATE);

  const user = useSelector((state: RootState) => state.user.userInfo);
  const dispatch = useDispatch();

  const templateContext = useContext(TemplateContext);
  if (!templateContext) return;
  const { setOpen, template, setEdit, setEditTemplate } = templateContext;

  return (
    <>
      <ConfirmDialog
        open={confirmDialog}
        setOpen={setConfirmDialog}
        onConfirm={async () => {
          const { data } = await deleteTemplate({
            variables: {
              userId: user?.id,
              templateId: template.id,
            },
          });
          if (data.deleteTemplate.receiverEmail) {
            toast.success("Template deleted successfully!", {
              description: data.deleteTemplate.receiverEmail,
            });
            dispatch(removeTemplate({ templateId: template.id }));
          } else {
            toast.error("Template deletion failed.", {
              description: "Try again.",
            });
          }
        }}
      />
      <DropdownMenu
        open={menu}
        onOpenChange={setMenu}
      >
        <DropdownMenuTrigger
          data-test="template-menu"
          asChild
        >
          {children}
        </DropdownMenuTrigger>
        <DropdownMenuContent className="flex flex-col min-w-[200px] border-[1px] border-gray-200">
          <DropdownMenuLabel>Template Options</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <button
            data-test="edit-template"
            onClick={() => {
              setMenu(false);
              setEdit(true);
              setEditTemplate(template);
              setOpen(true);
            }}
            className="flex items-center gap-2 px-2 py-1.5 hover:bg-gray-100 rounded-sm"
          >
            <Edit
              size={14}
              color="var(--color-theme-d)"
            />
            <span className="heading-desc">Edit</span>
          </button>
          <button
            onClick={() => {
              setMenu(false);
              setConfirmDialog(true);
            }}
            data-test="delete-template"
            className="flex items-center gap-2 px-2 py-1.5 hover:bg-gray-100 rounded-sm"
          >
            <Trash
              color="red"
              size={14}
            />
            <span className="heading-desc">Remove</span>
          </button>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
};

const Template = () => {
  const templateContext = useContext(TemplateContext);
  if (!templateContext) return;
  const { template } = templateContext;

  return (
    <div
      data-test="template"
      className="w-full min-w-[200px] max-w-[400px] max-sm:max-w-full flex flex-col gap-4 p-4 rounded-md border-[1px] border-gray-200 relative"
    >
      <TemplateMenu>
        <EllipsisVertical
          size={16}
          color="gray"
          className="absolute top-4 right-3"
        />
      </TemplateMenu>
      <div className="flex items-center gap-3 pr-2">
        <div className="max-md:w-9 w-10 aspect-square rounded-full bg-gray-100 border-[1px] border-gray-200 flex justify-center items-center">
          <PersonStanding
            size={20}
            color="gray"
          />
        </div>
        <h4 className="flex-1 truncate whitespace-nowrap overflow-hidden">
          {template.receiverName}
        </h4>
      </div>
      <div className="flex flex-col">
        <h5>Account Number</h5>
        <span className="small-heading-desc truncate whitespace-nowrap overflow-hidden">
          {template.receiverAccount}
        </span>
      </div>
      <div className="flex flex-col">
        <h5>Email</h5>
        <span className="small-heading-desc truncate whitespace-nowrap overflow-hidden">
          {template.receiverEmail}
        </span>
      </div>
    </div>
  );
};

export default Template;
