export function formatDate(date: Date): string {
  return date.toLocaleString("en-US", {
    weekday: "short", // "Wed"
    hour: "numeric", // "1"
    minute: "2-digit", // ":00"
    hour12: true, // "pm" instead of 24-hour format
  });
}

export const capitalizeFirstLetter = (word: string): string => {
  return word[0].toUpperCase() + word.slice(1);
};

export function formatAmount(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

export function generateCardNumber(): string {
  let cardNumber = "";
  for (let i = 0; i < 16; i++) {
    cardNumber += Math.floor(Math.random() * 10);
  }
  return cardNumber;
}

export function generateAccountNumber(): string {
  let accountNumber = "";
  for (let i = 0; i < 10; i++) {
    accountNumber += Math.floor(Math.random() * 10);
  }
  return accountNumber;
}

export function formatCardNumber(cardNumber: string): string {
  return cardNumber.replace(/(\d{4})(?=\d)/g, "$1 ");
}

export function formatAccountNumber(accountNumber: string): string {
  return accountNumber.replace(/(\d{3})(\d{3})(\d{4})/, "$1-$2-$3");
}

export function sortTransactionForBudgets(transactions: any[]) {
  const spent: Record<string, number> = {
    general: 0,
    entertainment: 0,
    food: 0,
    travel: 0,
    debt: 0,
  };

  transactions.forEach((tx) => {
    const category = tx.category;
    const amount = Number(tx.amount) || 0;

    if (spent.hasOwnProperty(category)) {
      spent[category] += amount;
    } else {
      spent.general += amount; // fallback to "general"
    }
  });

  return spent;
}

export const filterTransactions = (filter: string, transactions: any[]) => {
  if (!filter || filter === "all") return transactions;

  const dateFilters = ["oldest", "latest"];
  const amountFilters = ["largest", "smallest"];
  const statusFilters = ["completed", "declined", "pending"];
  const categoryFilters = [
    "entertainment",
    "travel",
    "food",
    "debt",
    "general",
  ];

  const cloned = [...transactions];

  if (dateFilters.includes(filter)) {
    return cloned.sort((a, b) => {
      const aDate = new Date(Number(a.createdAt)).getTime();
      const bDate = new Date(Number(b.createdAt)).getTime();
      return filter === "oldest" ? aDate - bDate : bDate - aDate;
    });
  }
  if (statusFilters.includes(filter)) {
    return cloned.filter((item) => item.status === filter);
  }
  if (categoryFilters.includes(filter)) {
    return cloned.filter((item) => item.category === filter);
  }

  if (amountFilters.includes(filter)) {
    return cloned.sort((a, b) => {
      const aAmount = Number(a.amount);
      const bAmount = Number(b.amount);
      return filter === "smallest" ? aAmount - bAmount : bAmount - aAmount;
    });
  }

  return cloned;
};

export const budgetsEmpty = (
  budgets:
    | {
        entertainment?: number;
        food?: number;
        travel?: number;
        debt?: number;
        general?: number;
      }
    | undefined
) => {
  if (
    !budgets ||
    (!budgets.entertainment &&
      !budgets.food &&
      !budgets.travel &&
      !budgets.debt &&
      !budgets.general)
  )
    return true;
  else return false;
};
