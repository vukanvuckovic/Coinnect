"use client";
import { setLoading, setUser } from "@/lib/features/user/userSlice";
import { gql, useQuery } from "@apollo/client";
import React, { useEffect } from "react";
import { useDispatch } from "react-redux";

const ME = gql`
  query Me {
    me {
      id
      firstName
      lastName
      address
      state
      postalCode
      dateOfBirth
      ssn
      email
      accounts {
        id
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

export const AuthComponent = () => {
  const { data, loading } = useQuery(ME);
  const dispatch = useDispatch();

  useEffect(() => {
    if (!loading) {
      data?.me ? dispatch(setUser(data.me)) : dispatch(setLoading(false));
    }
  }, [data, loading]);

  return <></>;
};

export default AuthComponent;
