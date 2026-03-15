type Category = "general" | "entertainment" | "food" | "travel" | "debt";
type Accounts = "savings" | "checking" | "credit" | "joint" | "business";
type CategoryColors = "red" | "blue" | "purple" | "orange" | "green";

type AccountInfo = {
  owner: string;
  coOwner: string;
  type: Accounts;
  cardNumber: string;
  pin: number;
};

type UserInput = {
  firstName: string;
  lastName: string;
  address: string;
  state: string;
  postalCode: string;
  dateOfBirth: string;
  ssn: string;
  email: string;
  password: string;
};

type Template = {
  id: string;
  receiverName: string;
  receiverEmail: string;
  receiverAccount: string;
};

type StaticFragment = {
  firstName: string;
  lastName: string;
  accountId: string;
  email: string;
};

type Transaction = {
  id: string;
  sender: {
    id: string;
    owner: {
      firstName: string;
      lastName: string;
    };
  };
  receiver: {
    id: string;
    owner: {
      firstName: string;
      lastName: string;
    };
  };
  senderStatic: StaticFragment;
  receiverStatic: StaticFragment;
  amount: number;
  note: string;
  status: string;
  category: string;
  createdAt: string;
};

type Account = {
  id: string;
  disabled: boolean;
  balance: number;
  type: string;
  accountName: string;
};

type Card = {
  id: string;
  user: {
    firstName: string;
    lastName: string;
  };
  type: string;
  expiry: string;
  cardNumber: string;
  disabled: boolean;
  accounts: string[];
};

type SignInFields = {
  email: string;
  password: string;
};

type SignUpFields = {
  firstName: string;
  lastName: string;
  address: string;
  state: string;
  postalCode: string;
  dateOfBirth: string;
  ssn: string;
  email: string;
  password: string;
};
