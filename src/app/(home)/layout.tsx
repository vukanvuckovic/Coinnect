"use client";

import "@/app/globals.css";
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/lib/store";
import { useRouter } from "next/navigation";
import HomeSidebar from "@/components/HomeSidebar";
import { MenuIcon } from "lucide-react";
import { setLoading as setLoader } from "@/lib/features/loader/loaderSlice";
import MobileSidebar from "@/components/MobileSidebar";

export default function HomeLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const user = useSelector((state: RootState) => state.user);

  const router = useRouter();
  const dispatch = useDispatch();

  useEffect(() => {
    if (!user.userInfo && !user.loading) router.push("/sign-in");
    if (user.loading) {
      dispatch(setLoader(true));
    } else {
      dispatch(setLoader(false));
    }
  }, [user.userInfo, user.loading]);

  return (
    user.userInfo &&
    !user.loading && (
      <div className="flex flex-col w-full">
        <div className="md:hidden flex items-center justify-between max-md:py-2.5 p-4 custom-shadow bg-white">
          <MobileSidebar>
            <MenuIcon
              size={20}
              color="gray"
            />
          </MobileSidebar>
          <span className="text-lg text-theme-d font-bold">Coinnect</span>
        </div>
        <div className="flex w-full max-w-[1960px] mx-auto">
          <div className="max-md:hidden">
            <HomeSidebar />
          </div>
          <div className="flex-1 flex min-w-0">{children}</div>
        </div>
      </div>
    )
  );
}
