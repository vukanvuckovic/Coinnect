"use client"
import React from "react";
import AuthComponent from "@/components/AuthComponent";
import Loader from "@/components/Loader";
import ApolloAppProvider from "@/app/ApolloProvider";
import StoreProvider from "@/app/StoreProvider";

const LayoutWrapper = ({ children }: { children: React.ReactNode }) => {
  return (
    <ApolloAppProvider>
      <StoreProvider>
        <AuthComponent />
        {children}
        <Loader />
      </StoreProvider>
    </ApolloAppProvider>
  );
};

export default LayoutWrapper;
