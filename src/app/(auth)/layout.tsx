"use client";
import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/lib/store";
import { useRouter } from "next/navigation";
import { setLoading } from "@/lib/features/loader/loaderSlice";
import Image from "next/image";

const AuthLayout = ({ children }: { children: React.ReactNode }) => {
  const user = useSelector((state: RootState) => state.user);

  const router = useRouter();
  const dispatch = useDispatch();

  useEffect(() => {
    if (user.userInfo) router.push("/home");
    if (user.loading) {
      dispatch(setLoading(true));
    } else {
      dispatch(setLoading(false));
    }
  }, [user.userInfo, user.loading]);

  return (
    !user.userInfo &&
    !user.loading && (
      <div className="flex min-h-[100vh]">
        <div className="shrink-0 flex-1 flex flex-col justify-center items-end">
          {children}
        </div>
        <div className="max-md:hidden shrink-0 flex-1 h-[100vh] sticky top-0 bg-blue-50 flex justify-end items-center overflow-hidden">
          <div className="shrink-0 w-full h-full relative">
            <div className="w-[800px] h-[400px] absolute left-[20%] top-1/2 -translate-y-1/2">
              <Image
                src={"/images/home.png"}
                alt="home"
                width={800}
                height={400}
                className="object-cover object-left rounded-md overflow-hidden border-2 border-gray-200 custom-shadow"
              />
            </div>
          </div>
        </div>
      </div>
    )
  );
};

export default AuthLayout;
