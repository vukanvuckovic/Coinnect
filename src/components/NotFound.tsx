import { BadgeAlert } from "lucide-react";
import React from "react";

const NotFound = ({ message }: { message: string }) => {
  return (
    <div className="h-full w-full flex justify-center items-center">
      <div className="flex flex-col items-center gap-2 py-2">
        <BadgeAlert
          size={60}
          color="var(--color-theme-d)"
        />
        <span className="text-theme-gray-dark-2">{message}</span>
      </div>
    </div>
  );
};

export default NotFound;
