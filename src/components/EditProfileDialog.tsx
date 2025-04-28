import React, { useEffect } from "react";
import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/lib/store";
import { gql, useMutation } from "@apollo/client";
import { setUser } from "@/lib/features/user/userSlice";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { SignUpFields } from "./AuthForm";

const EditProfileDialog = ({
  open,
  setOpen,
}: {
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
}) => {
  const user = useSelector((state: RootState) => state.user.userInfo);
  const dispatch = useDispatch();

  const [formData, setFormData] = useState({
    firstName: user?.firstName ?? "",
    lastName: user?.lastName ?? "",
    address: user?.address ?? "",
    state: user?.state ?? "",
    postalCode: user?.postalCode ?? "",
    dateOfBirth: new Date(
      user?.dateOfBirth ? Number(user.dateOfBirth) : Date.now()
    )
      .toISOString()
      .split("T")[0],
    ssn: "",
    email: user?.email ?? "",
    password: "",
  });

  const isFormUnchanged = () => {
    if (!user) return true;

    const normalizedFormData = {
      firstName: formData.firstName,
      lastName: formData.lastName,
      address: formData.address,
      state: formData.state,
      postalCode: formData.postalCode,
      dateOfBirth: formData.dateOfBirth,
      email: formData.email,
    };

    const normalizedUserData = {
      firstName: user.firstName ?? "",
      lastName: user.lastName ?? "",
      address: user.address ?? "",
      state: user.state ?? "",
      postalCode: user.postalCode ?? "",
      dateOfBirth: new Date(
        user.dateOfBirth ? Number(user.dateOfBirth) : Date.now()
      )
        .toISOString()
        .split("T")[0],
      email: user.email ?? "",
    };

    return (
      JSON.stringify(normalizedFormData) === JSON.stringify(normalizedUserData)
    );
  };

  const UPDATE_USER = gql`
    mutation UpdateUser($id: ID, $userInfo: UserInput) {
      updateUser(id: $id, userInfo: $userInfo) {
        id
        firstName
        lastName
        address
        state
        postalCode
        dateOfBirth
        email
        budgets {
          food
          travel
          debt
          general
          entertainment
        }
      }
    }
  `;

  const [updateUser, { loading: updateLoading, error: updateError }] =
    useMutation(UPDATE_USER);

  useEffect(() => {
    if (updateError) {
      toast.error("Error updating user.", {
        description: updateError.message,
      });
    }
  }, [updateError]);

  return (
    <Dialog
      open={open}
      onOpenChange={setOpen}
    >
      <DialogContent className="outline-none ring-0 border-none duration-200 max-h-[90dvh] overflow-y-scroll scrollbar-none">
        <DialogHeader hidden>
          <DialogTitle />
        </DialogHeader>
        <div className="flex flex-col gap-6 w-full max-w-[470px]">
          <div className="flex flex-col py-2">
            <h2 className="font-bold text-4xl">Edit Account</h2>
            <span className="heading-desc text-sm">
              Edit your information and save the changes.
            </span>
          </div>
          <SignUpFields
            formData={formData}
            setFormData={setFormData}
          />
          <button
            onClick={async () => {
              const { data } = await updateUser({
                variables: {
                  id: user?.id,
                  userInfo: {
                    ...formData,
                    email:
                      user?.email === formData.email
                        ? undefined
                        : formData.email,
                  },
                },
              });

              if (data.updateUser.id) {
                toast.success("User updated.");
                dispatch(setUser(data.updateUser));
              } else {
                toast.error("Failed to update user.");
              }
              setOpen(false);
            }}
            className="dialog-button disabled:opacity-80"
            disabled={isFormUnchanged()}
          >
            {updateLoading ? "Saving changes..." : "Save changes"}
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default EditProfileDialog;
