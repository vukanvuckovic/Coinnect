"use client";

import "@/app/globals.css";
import { sidebarLinks } from "@/constants/data";
import { Edit, LogOut, Settings } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/lib/store";
import { gql, useMutation } from "@apollo/client";
import { setUser } from "@/lib/features/user/userSlice";
import { toast } from "sonner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import EditProfileDialog from "./EditProfileDialog";
import Image from "next/image";

const SIGN_OUT = gql`
  mutation SignOut {
    signOut
  }
`;

const UserDropdown = ({
  children,
  onEditClick,
}: {
  children: React.ReactNode;
  onEditClick: () => void;
}) => {
  const [openDropdown, setOpenDropdown] = useState(false);
  const [signOut] = useMutation(SIGN_OUT);
  const dispatch = useDispatch();

  return (
    <DropdownMenu open={openDropdown} onOpenChange={setOpenDropdown}>
      <DropdownMenuTrigger
        data-test="user-menu-trigger"
        className="shrink-0"
        asChild
      >
        {children}
      </DropdownMenuTrigger>
      <DropdownMenuContent className="border-gray-200 ring-0">
        <DropdownMenuLabel>User Options</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <button
          onClick={() => {
            onEditClick();
            setOpenDropdown(false);
          }}
          className="flex items-center gap-2 px-2 py-1.5 w-full hover:bg-gray-100 rounded-sm"
        >
          <Edit size={14} color="var(--color-theme-d)" />
          <span className="heading-desc">Edit</span>
        </button>
        <DropdownMenuItem
          data-test="user-menu-logout"
          onClick={async () => {
            const res = await signOut();
            if (res) {
              dispatch(setUser(undefined));
            } else {
              toast.error("Error logging out.");
            }
          }}
          className="flex items-center gap-2 px-2 py-1.5 hover:bg-gray-100 rounded-sm cursor-pointer"
        >
          <LogOut size={14} color="red" />
          <span className="heading-desc">Log Out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

const SideBarLink = ({
  title,
  standardIcon,
  selectedIcon,
  setOpen,
  url,
}: {
  title: string;
  standardIcon: React.ReactNode;
  selectedIcon: React.ReactNode;
  setOpen?: () => void;
  url: string;
}) => {
  const pathname = usePathname();
  const selected = pathname.includes(url);

  return (
    <Link
      onClick={setOpen}
      href={url}
      className={`flex items-center gap-3 hover:gap-4 max-md:py-2 py-3 max-md:px-3 px-4 rounded-md cursor-pointer ${
        selected && "bg-theme-d gap-4"
      } duration-200`}
    >
      {selected ? selectedIcon : standardIcon}
      <span
        className={`${
          selected ? "text-white" : "text-theme-gray-dark"
        } duration-200 max-md:text-[14px] text-[16px] font-semibold`}
      >
        {title}
      </span>
    </Link>
  );
};

const HomeSidebar = ({ setOpen }: { setOpen?: () => void }) => {
  const [editOpen, setEditOpen] = useState(false);
  const user = useSelector((state: RootState) => state.user);

  return (
    <div className="h-[100dvh] overflow-y-scroll scrollbar-none w-[280px] flex flex-col gap-4 max-md:p-3 p-4 border-r-[1px] border-gray-200 sticky top-0 left-0">
      <EditProfileDialog open={editOpen} setOpen={setEditOpen} />
      <div className="shrink-0 flex items-center gap-2 py-4">
        <Image
          src={"/icons/logo.png"}
          alt="logo"
          height={32}
          width={32}
          className="object-contain"
        />
        <h3 className="!font-bold">Coinnect</h3>
      </div>
      <div className="flex-1 flex flex-col gap-4">
        {sidebarLinks.map((item, index) => (
          <SideBarLink
            key={index}
            title={item.title}
            standardIcon={item.standardIcon}
            selectedIcon={item.selectedIcon}
            setOpen={setOpen}
            url={item.url}
          />
        ))}
      </div>
      <div className="shrink-0 flex items-center gap-3 pt-4 border-t-[1px] border-gray-200">
        <div className="shrink-0 w-10 aspect-square rounded-full bg-blue-100/80 custom-shadow flex justify-center items-center">
          <span className="font-black text-theme-d text-xl">
            {user.userInfo?.firstName[0].toUpperCase()}
          </span>
        </div>
        <div className="flex-1 flex flex-col justify-start overflow-hidden">
          <span className="text-sm font-semibold truncate whitespace-nowrap overflow-hidden">
            {user.userInfo?.firstName} {user.userInfo?.lastName}
          </span>
          <span className="text-sm font-normal text-theme-gray-light truncate whitespace-nowrap overflow-hidden">
            {user.userInfo?.email}
          </span>
        </div>
        <UserDropdown onEditClick={() => setEditOpen(true)}>
          <Settings size={18} color="#475467" className="shrink-0" />
        </UserDropdown>
      </div>
    </div>
  );
};

export default HomeSidebar;
