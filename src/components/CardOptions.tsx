"use client";
import React, { Dispatch, SetStateAction, useState } from "react";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  ChevronLeft,
  ChevronRight,
  CreditCard,
  Loader2,
  Lock,
  Trash,
} from "lucide-react";
import { toast } from "sonner";
import { gql, useMutation } from "@apollo/client";
import { useDispatch, useSelector } from "react-redux";
import { updateCardDisabled } from "@/lib/features/user/userSlice";
import { RootState } from "@/lib/store";
import ConfirmDialog from "./ConfirmDialog";
import { refetchAccountsTransactionsCards } from "@/lib/features/helper/refetchHelperSlice";

const PinComponent = ({
  setPinChanging,
  card,
  setOpen,
}: {
  setPinChanging: React.Dispatch<React.SetStateAction<boolean>>;
  card: string;
  setOpen: Dispatch<SetStateAction<boolean>>;
}) => {
  const [pin, setPin] = useState("");
  const [newPin, setNewPin] = useState("");
  const [confirmNewPin, setConfirmNewPin] = useState("");
  const [step, setStep] = useState(0);

  const [oldPinCorrect, setOldPinCorrect] = useState(false);

  const VERIFY_PIN = gql`
    mutation VerifyPin($id: ID, $pin: Int, $userId: ID) {
      verifyPin(id: $id, pin: $pin, userId: $userId)
    }
  `;

  const [verifyPin, { loading: verifyPinLoading }] = useMutation(VERIFY_PIN);

  const CHANGE_PIN = gql`
    mutation ChangePin($id: ID, $pin: Int, $userId: ID) {
      changePin(id: $id, pin: $pin, userId: $userId) {
        id
      }
    }
  `;

  const [changePin, { loading: changePinLoading }] = useMutation(CHANGE_PIN);

  const user = useSelector((state: RootState) => state.user.userInfo);

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center gap-2">
        <button onClick={() => setPinChanging(false)}>
          <ChevronLeft
            size={24}
            color="var(--color-theme-d)"
          />
        </button>
        <div className="flex flex-col gap-1">
          <h4 className="leading-none max-md:!text-sm">
            {!oldPinCorrect && step === 1 ? "Enter new PIN" : "Current PIN"}
          </h4>
          <span className="small-heading-desc max-md:!text-[10px]">
            {!oldPinCorrect || step === 0
              ? "Confirm your identity by confirming current PIN"
              : oldPinCorrect && step === 1 && "Change your PIN"}
          </span>
        </div>
      </div>

      {!oldPinCorrect || step === 0 ? (
        <div className="flex flex-col gap-1">
          <span className="max-md:text-[10px] text-xs text-theme-gray-dark">
            Current PIN
          </span>
          <input
            type="number"
            placeholder="1234"
            value={pin}
            onChange={(v) => setPin(v.target.value)}
            className="payment-input no-spinner"
          />
        </div>
      ) : (
        oldPinCorrect &&
        step === 1 && (
          <>
            <div className="flex flex-col gap-1">
              <span className="max-md:text-[10px] text-xs text-theme-gray-dark">
                New PIN
              </span>
              <input
                type="number"
                placeholder="1234"
                value={newPin}
                onChange={(v) => setNewPin(v.target.value)}
                className="payment-input no-spinner"
              />
            </div>
            <div className="flex flex-col gap-1">
              <span className="max-md:text-[10px] text-xs text-theme-gray-dark">
                Confirm new PIN
              </span>
              <input
                type="number"
                placeholder="1234"
                value={confirmNewPin}
                onChange={(v) => setConfirmNewPin(v.target.value)}
                className="payment-input no-spinner"
              />
            </div>
          </>
        )
      )}
      <div className="flex items-center gap-2">
        {step === 1 && (
          <button
            onClick={() => {
              setStep(0);
            }}
            className="flex-1 dialog-side-button"
          >
            Back
          </button>
        )}
        {!oldPinCorrect || step === 0 ? (
          <button
            onClick={async () => {
              try {
                if (!oldPinCorrect) {
                  const { data } = await verifyPin({
                    variables: {
                      pin: Number(pin),
                      id: card,
                      userId: user?.id,
                    },
                  });
                  if (data.verifyPin) {
                    toast.success("PIN Correct.");
                    setOldPinCorrect(true);
                    setStep(1);
                  } else
                    toast.error("PIN incorrect.", {
                      description: "Try again.",
                    });
                } else {
                  setStep(1);
                }
              } catch (error: unknown) {
                toast.error("Error occured.", {
                  description: error instanceof Error ? error.message : "Unknown error",
                });
              }
            }}
            className="flex-1 dialog-button"
          >
            {verifyPinLoading ? "Verifying..." : "Next"}
          </button>
        ) : (
          oldPinCorrect &&
          step === 1 && (
            <button
              disabled={changePinLoading}
              onClick={async () => {
                if (newPin === confirmNewPin) {
                  try {
                    const { data } = await changePin({
                      variables: {
                        id: card,
                        pin: Number(newPin),
                        userId: user?.id,
                      },
                    });
                    if (data.changePin.id) {
                      toast.success("PIN changed!");
                      setPinChanging(false);
                      setOpen(false);
                    } else {
                      toast.error("PIN changing failed.");
                    }
                  } catch (error: unknown) {
                    toast.error("PIN changing failed.", {
                      description: error instanceof Error ? error.message : "Unknown error",
                    });
                  }
                } else {
                  toast.error("Confirmed PIN doesn't match the new one.");
                }
              }}
              className="flex-1 flex justify-center items-center gap-2 dialog-button disabled:opacity-70"
            >
              Save PIN
              {changePinLoading && (
                <Loader2
                  size={16}
                  color="white"
                  className="animate-spin"
                />
              )}
            </button>
          )
        )}
      </div>
    </div>
  );
};

const CardOptions = ({
  children,
  card,
}: {
  children: React.ReactNode;
  card: Card;
}) => {
  const [open, setOpen] = useState(false);
  const [pinChanging, setPinChanging] = useState(false);

  const [deleteAlert, setDeleteAlert] = useState(false);
  const [disableAlert, setDisableAlert] = useState(false);
  const [enableAlert, setEnableAlert] = useState(false);

  const SET_CARD_DISABLED = gql`
    mutation SetCardDisabled($id: ID, $userId: ID, $disabled: Boolean) {
      setCardDisabled(id: $id, userId: $userId, disabled: $disabled) {
        id
      }
    }
  `;

  const [setCardDisabled] = useMutation(SET_CARD_DISABLED);

  const DELETE_CARD = gql`
    mutation DeleteCard($id: ID, $userId: ID) {
      deleteCard(id: $id, userId: $userId) {
        id
      }
    }
  `;

  const [deleteCard] = useMutation(DELETE_CARD);

  const dispatch = useDispatch();

  const user = useSelector((state: RootState) => state.user.userInfo);

  return (
    <>
      <ConfirmDialog
        open={disableAlert}
        setOpen={setDisableAlert}
        onConfirm={async () => {
          const { data } = await setCardDisabled({
            variables: {
              id: card.id,
              userId: user?.id,
              disabled: true,
            },
          });
          if (data.setCardDisabled.id) {
            toast.success("Successfully disabled this card!");
            dispatch(
              updateCardDisabled({
                cardId: data.setCardDisabled.id,
                disabled: true,
              })
            );
            dispatch(refetchAccountsTransactionsCards());
          } else {
            toast.error("Error disabling this card.");
          }
          setOpen(false);
        }}
        message="Are you sure you want to disable this card?"
      />
      <ConfirmDialog
        open={enableAlert}
        setOpen={setEnableAlert}
        onConfirm={async () => {
          const { data } = await setCardDisabled({
            variables: {
              id: card.id,
              userId: user?.id,
              disabled: false,
            },
          });
          if (data.setCardDisabled.id) {
            toast.success("Successfully enabled this card!");
            dispatch(
              updateCardDisabled({
                cardId: data.setCardDisabled.id,
                disabled: false,
              })
            );
            dispatch(refetchAccountsTransactionsCards());
          } else {
            toast.error("Error enabling this card.");
          }
          setOpen(false);
        }}
        message="Are you sure you want to enable this card?"
      />
      <ConfirmDialog
        open={deleteAlert}
        setOpen={setDeleteAlert}
        onConfirm={async () => {
          const { data } = await deleteCard({
            variables: { id: card.id, userId: user?.id },
          });
          if (data.deleteCard.id) {
            toast.success("Card deleted successfully!");
          } else {
            toast.error("Failed to remove the card.");
          }
          setOpen(false);
        }}
        message="Are you sure you want to remove this card? This will also remove all the accounts attached to this card."
      />

      <Dialog
        open={open}
        onOpenChange={setOpen}
      >
        <DialogTrigger asChild>{children}</DialogTrigger>
        <DialogContent className="p-4 outline-none ring-0 ring-transparent border-none duration-200">
          <DialogHeader hidden>
            <DialogTitle />
          </DialogHeader>
          {pinChanging ? (
            <PinComponent
              card={card.id}
              setPinChanging={setPinChanging}
              setOpen={setOpen}
            />
          ) : (
            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-2 p-2">
                <h4 className="leading-none">Card Options</h4>
                <span className="small-heading-desc leading-none">
                  Choose what happens with this card.
                </span>
              </div>
              <ul className="flex flex-col gap-1">
                <li>
                  <button
                    onClick={() => setPinChanging(true)}
                    className="w-full flex gap-3 outline-none py-4 pl-2 border-t-[1px] border-t-gray-200"
                  >
                    <Lock
                      size={14}
                      color="green"
                      className="shrink-0"
                    />
                    <div className="flex-1 flex flex-col items-start gap-2">
                      <h5 className="leading-none text-theme-gray-dark">
                        Change PIN
                      </h5>
                      <span className="small-heading-desc text-left leading-none">
                        Change the PIN with which you authorize payments and
                        access the ATM.
                      </span>
                    </div>
                    <ChevronRight
                      size={16}
                      color="gray"
                      className="self-center"
                    />
                  </button>
                </li>
                {!card.disabled ? (
                  <li>
                    <button
                      onClick={() => setDisableAlert(true)}
                      data-test="disable-card"
                      className="w-full flex gap-3 outline-none py-4 pl-2 border-t-[1px] border-t-gray-200"
                    >
                      <CreditCard
                        size={14}
                        color={"var(--color-theme-d)"}
                        className="shrink-0"
                      />
                      <div className="flex flex-col items-start gap-2">
                        <h5 className="leading-none text-theme-gray-dark">
                          Disable card
                        </h5>
                        <span className="small-heading-desc leading-none">
                          Useful in case of lost or stolen cards.
                        </span>
                      </div>
                    </button>
                  </li>
                ) : (
                  <li>
                    <button
                      onClick={() => setEnableAlert(true)}
                      data-test="enable-card"
                      className="w-full flex gap-3 outline-none py-4 pl-2 border-t-[1px] border-t-gray-200"
                    >
                      <CreditCard
                        size={14}
                        color={"var(--color-theme-d)"}
                        className="shrink-0"
                      />
                      <div className="flex flex-col items-start gap-2">
                        <h5 className="leading-none text-theme-gray-dark">
                          Enable card
                        </h5>
                        <span className="small-heading-desc text-left leading-none">
                          Enable your previously disabled card.
                        </span>
                      </div>
                    </button>
                  </li>
                )}
                <li>
                  <button
                    onClick={() => setDeleteAlert(true)}
                    className="w-full flex gap-3 outline-none py-4 pl-2 border-t-[1px] border-t-gray-200"
                  >
                    <Trash
                      size={14}
                      color="red"
                      className="shrink-0"
                    />
                    <div className="flex flex-col items-start gap-2">
                      <h5 className="leading-none">Remove card</h5>
                      <span className="small-heading-desc text-left leading-none">
                        Completely disable and remove the card along with the
                        attached accounts.
                      </span>
                    </div>
                  </button>
                </li>
              </ul>
              <DialogClose className="dialog-button">Done</DialogClose>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};

export default CardOptions;
