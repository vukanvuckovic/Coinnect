import React from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

const ConfirmDialog = ({
  children,
  open,
  setOpen,
  onConfirm,
  message,
}: {
  children?: React.ReactNode;
  open?: boolean;
  setOpen?: React.Dispatch<React.SetStateAction<boolean>>;
  onConfirm: () => void;
  message?: string;
}) => {
  return (
    <AlertDialog
      open={open}
      onOpenChange={setOpen}
    >
      <AlertDialogTrigger
        hidden={!children}
        asChild
      >
        {children}
      </AlertDialogTrigger>
      <AlertDialogContent className="border-gray-200">
        <AlertDialogHeader>
          <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
          <AlertDialogDescription>
            {message ??
              "This action cannot be undone. Are you sure you want to proceed?"}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel className="border-gray-200">
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction
            data-test="alert-continue"
            className="bg-theme-d font-semibold"
            onClick={() => {
              onConfirm();
            }}
          >
            Continue
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default ConfirmDialog;
