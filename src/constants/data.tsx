import React from "react";
import {
  BadgeDollarSign,
  BookTemplate,
  CreditCard,
  Home,
  Joystick,
  Palmtree,
  PersonStanding,
  PiggyBank,
  Pizza,
  Sun,
} from "lucide-react";

export const sidebarLinks = [
  {
    title: "Home",
    url: "/home",
    selectedIcon: (
      <Home
        size={24}
        color="white"
      />
    ),
    standardIcon: (
      <Home
        size={24}
        color="gray"
      />
    ),
  },
  {
    title: "Cards",
    url: "/cards",
    selectedIcon: (
      <CreditCard
        size={24}
        color="white"
      />
    ),
    standardIcon: (
      <CreditCard
        size={24}
        color="gray"
      />
    ),
  },
  {
    title: "Accounts",
    url: "/accounts",
    selectedIcon: (
      <PersonStanding
        size={24}
        color="white"
      />
    ),
    standardIcon: (
      <PersonStanding
        size={24}
        color="gray"
      />
    ),
  },
  {
    title: "Payments",
    url: "/payments",
    selectedIcon: (
      <BadgeDollarSign
        size={24}
        color="white"
      />
    ),
    standardIcon: (
      <BadgeDollarSign
        size={24}
        color="gray"
      />
    ),
  },
  {
    title: "Templates",
    url: "/templates",
    selectedIcon: (
      <BookTemplate
        size={24}
        color="white"
      />
    ),
    standardIcon: (
      <BookTemplate
        size={24}
        color="gray"
      />
    ),
  },
  {
    title: "Budgets",
    url: "/budgets",
    selectedIcon: (
      <PiggyBank
        size={24}
        color="white"
      />
    ),
    standardIcon: (
      <PiggyBank
        size={24}
        color="gray"
      />
    ),
  },
];

export const budgetCategories: { name: Category; color: CategoryColors; icon: React.ReactNode }[] = [
  {
    name: "general",
    color: "green",
    icon: (
      <Sun
        color="green"
        size={24}
      />
    ),
  },
  {
    name: "entertainment",
    color: "orange",
    icon: (
      <Joystick
        color="darkorange"
        size={24}
      />
    ),
  },
  {
    name: "food",
    color: "purple",
    icon: (
      <Pizza
        color="purple"
        size={24}
      />
    ),
  },
  {
    name: "travel",
    color: "blue",
    icon: (
      <Palmtree
        color="blue"
        size={24}
      />
    ),
  },
  {
    name: "debt",
    color: "red",
    icon: (
      <CreditCard
        color="red"
        size={24}
      />
    ),
  },
];

export const colorMap50 = {
  red: "bg-red-50",
  green: "bg-green-50",
  blue: "bg-blue-50",
  orange: "bg-orange-50",
  purple: "bg-purple-50",
};

export const colorMap100 = {
  red: "bg-red-100",
  green: "bg-green-100",
  blue: "bg-blue-100",
  orange: "bg-orange-100",
  purple: "bg-purple-100",
};

export const colorMap200 = {
  red: "bg-red-200",
  green: "bg-green-200",
  blue: "bg-blue-200",
  orange: "bg-orange-200",
  purple: "bg-purple-200",
};

export const colorMap600 = {
  red: "bg-red-600",
  green: "bg-green-600",
  blue: "bg-blue-600",
  orange: "bg-orange-600",
  purple: "bg-purple-600",
};

export const colorMap700 = {
  red: "text-red-700",
  green: "text-green-700",
  blue: "text-blue-700",
  orange: "text-orange-700",
  purple: "text-purple-700",
};

export const monthNames = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

export const accountColors = {
  savings: "#0179FE",
  checking: "#0179FE",
  credit: "#b52222",
  joint: "#b55a22",
  business: "#b59a22",
};
