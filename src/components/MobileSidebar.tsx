"use client";
import React, { useState } from "react";
import {
  Sheet,
  SheetContent,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import HomeSidebar from "./HomeSidebar";

const MobileSidebar = ({ children }: { children: React.ReactNode }) => {
  const [open, setOpen] = useState(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger className="md:hidden" asChild>
        {children}
      </SheetTrigger>
      <SheetContent className="md:hidden w-fit border-0" side="left">
        <SheetTitle hidden />
        <HomeSidebar setOpen={() => setOpen(false)} />
      </SheetContent>
    </Sheet>
  );
};

export default MobileSidebar;
