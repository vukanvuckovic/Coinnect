import React from "react";

interface PageHeaderProps {
  title: string;
  description: string;
  action?: React.ReactNode;
}

const PageHeader = ({ title, description, action }: PageHeaderProps) => {
  return (
    <div className="flex max-md:flex-col max-md:items-start gap-2 items-center justify-between">
      <div className="flex flex-col gap-1">
        <h4>{title}</h4>
        <span className="heading-desc">{description}</span>
      </div>
      {action}
    </div>
  );
};

export default PageHeader;
