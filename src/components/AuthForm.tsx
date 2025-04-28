"use client";
import FormInput from "@/components/FormInput";
import { setUser } from "@/lib/features/user/userSlice";
import { gql, useMutation } from "@apollo/client";
import { Loader2 } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import React, { SetStateAction, useState } from "react";
import { useDispatch } from "react-redux";
import { toast } from "sonner";

const SIGN_UP = gql`
  mutation CreateUser($userInput: UserInput!) {
    createUser(userInput: $userInput) {
      id
      firstName
    }
  }
`;

const SIGN_IN = gql`
  mutation SignIn($userCredentials: UserCredentials!) {
    signIn(userCredentials: $userCredentials) {
      id
      firstName
      lastName
      address
      state
      postalCode
      dateOfBirth
      ssn
      email
      cards {
        id
        user {
          firstName
          lastName
        }
        type
        accounts {
          cardNumber
        }
        expiry
        cardNumber
        disabled
      }
      accounts {
        id
        balance
        type
      }
      templates {
        id
        receiverAccount
        receiverName
        receiverEmail
      }
      budgets {
        entertainment
        food
        travel
        debt
        general
      }
    }
  }
`;

export const SignUpFields = ({
  formData,
  setFormData,
}: {
  formData: SignUpFields;
  setFormData: React.Dispatch<SetStateAction<SignUpFields>>;
}) => {
  const handleChange =
    (field: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
      setFormData((prev) => ({ ...prev, [field]: e.target.value }));
    };

  return (
    <div className="flex flex-col gap-3">
      <div className="flex max-md:flex-col md:items-center gap-3">
        <FormInput
          dataTest="first-name"
          label="First name"
          placeholder="John"
          value={formData.firstName}
          onChange={handleChange("firstName")}
        />
        <FormInput
          dataTest="last-name"
          label="Last name"
          placeholder="Doe"
          value={formData.lastName}
          onChange={handleChange("lastName")}
        />
      </div>
      <FormInput
        dataTest="address"
        label="Address"
        placeholder="Enter your specific address"
        value={formData.address}
        onChange={handleChange("address")}
      />
      <div className="flex max-md:flex-col md:items-center gap-3">
        <FormInput
          dataTest="state"
          label="State"
          placeholder="ex: NY"
          value={formData.state}
          onChange={handleChange("state")}
        />
        <FormInput
          dataTest="postal-code"
          label="Postal code"
          placeholder="ex: 11101"
          value={formData.postalCode}
          onChange={handleChange("postalCode")}
        />
      </div>
      <div className="flex max-md:flex-col md:items-center gap-3">
        <FormInput
          dataTest="date-of-birth"
          label="Date of birth"
          type="date"
          placeholder="yyyy-mm-dd"
          value={formData.dateOfBirth}
          onChange={handleChange("dateOfBirth")}
        />
        <FormInput
          dataTest="ssn"
          label="SSN"
          placeholder="ex: 1234"
          value={formData.ssn}
          onChange={handleChange("ssn")}
        />
      </div>
      <FormInput
        dataTest="auth-email"
        label="Email"
        placeholder="johndoe@example.com"
        value={formData.email}
        onChange={handleChange("email")}
      />
      <FormInput
        dataTest="auth-password"
        label="Password"
        type="password"
        placeholder="Choose your password"
        value={formData.password}
        onChange={handleChange("password")}
      />
    </div>
  );
};

const SignInFields = ({
  formData,
  setFormData,
}: {
  formData: SignInFields;
  setFormData: React.Dispatch<React.SetStateAction<SignInFields>>;
}) => {
  const handleChange =
    (field: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
      setFormData((prev) => ({ ...prev, [field]: e.target.value }));
    };

  return (
    <div className="flex flex-col gap-3">
      <FormInput
        dataTest="auth-email"
        label="Email"
        placeholder="johndoe@example.com"
        value={formData.email}
        onChange={handleChange("email")}
      />
      <FormInput
        dataTest="auth-password"
        label="Password"
        type="password"
        placeholder="Your password"
        value={formData.password}
        onChange={handleChange("password")}
      />
    </div>
  );
};

const AuthForm = ({ type }: { type: "sign-in" | "sign-up" }) => {
  const [signUpFormData, setSignUpFormData] = useState<SignUpFields>({
    firstName: "",
    lastName: "",
    address: "",
    state: "",
    postalCode: "",
    dateOfBirth: "",
    ssn: "",
    email: "",
    password: "",
  });
  const [signInFormData, setSignInFormData] = useState<SignInFields>({
    email: "",
    password: "",
  });

  const [createUser, { loading: signUpLoading }] = useMutation(SIGN_UP);
  const [signIn, { loading: signInLoading }] = useMutation(SIGN_IN);
  const dispatch = useDispatch();

  const handleSignUp = async () => {
    try {
      const { data: signUpData } = await createUser({
        variables: { userInput: signUpFormData },
      });
      if (!signUpData.createUser.id) {
        toast.error("Account creation failed.");
        return;
      }
      toast.success("Account created!");
      const { data: signInData } = await signIn({
        variables: {
          userCredentials: {
            email: signUpFormData.email,
            password: signUpFormData.password,
          },
        },
      });
      if (signInData.signIn) {
        dispatch(setUser(signInData.signIn));
      }
    } catch (error: unknown) {
      toast.error("Error signing up.", {
        description: error instanceof Error ? error.message : "Unknown error",
      });
    }
  };

  const handleSignIn = async () => {
    try {
      const { data } = await signIn({
        variables: { userCredentials: signInFormData },
      });
      if (data.signIn) {
        dispatch(setUser(data.signIn));
      } else {
        toast.error("Error signing in.", { description: "Try again later." });
      }
    } catch (error: unknown) {
      toast.error("Error signing in.", {
        description: error instanceof Error ? error.message : "Unknown error",
      });
    }
  };

  const isSignUp = type === "sign-up";

  return (
    <div className="flex flex-col items-center w-full max-w-[1000px] max-md:p-5 p-6">
      <div className="flex flex-col gap-6 w-full max-w-[470px]">
        <div className="flex items-center gap-2">
          <Image
            src={"/icons/logo.png"}
            alt="logo"
            height={24}
            width={24}
            className="object-contain"
          />
          <h3
            data-test="auth-heading"
            className="!text-theme-d !font-bold"
          >
            Coinnect
          </h3>
        </div>

        <div className="flex flex-col mb-4">
          <h2 className="font-bold">{isSignUp ? "Sign Up" : "Sign In"}</h2>
          <span className="heading-desc">Manage your finances seamlessly.</span>
        </div>

        {isSignUp ? (
          <SignUpFields
            formData={signUpFormData}
            setFormData={setSignUpFormData}
          />
        ) : (
          <SignInFields
            formData={signInFormData}
            setFormData={setSignInFormData}
          />
        )}

        <button
          data-test={isSignUp ? "sign-up-button" : "sign-in-button"}
          disabled={isSignUp ? signUpLoading : signInLoading}
          onClick={isSignUp ? handleSignUp : handleSignIn}
          className="dialog-button flex items-center justify-center gap-2 disabled:opacity-80"
        >
          {isSignUp ? "Sign Up" : "Sign In"}
          {(isSignUp ? signUpLoading : signInLoading) && (
            <Loader2
              size={16}
              color="white"
              className="animate-spin"
            />
          )}
        </button>

        <span className="max-md:text-xs text-sm self-center">
          {isSignUp ? (
            <>
              <span>Already have an account? </span>
              <Link
                href={"/sign-in"}
                className="text-theme-d font-medium"
              >
                Sign In!
              </Link>
            </>
          ) : (
            <>
              <span>Don&apos;t have an account? </span>
              <Link
                href={"/sign-up"}
                className="text-theme-d font-medium"
              >
                Sign Up!
              </Link>
            </>
          )}
        </span>
      </div>
    </div>
  );
};

export default AuthForm;
