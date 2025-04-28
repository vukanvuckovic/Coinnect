import React from "react";

interface PaymentFieldProps {
  label: string;
  description?: string;
  children: React.ReactNode;
}

const PaymentField = ({ label, description, children }: PaymentFieldProps) => {
  return (
    <div className="flex flex-col payment-section">
      <div className="flex max-md:flex-col max-md:gap-4 gap-16 max-w-[800px]">
        <div className="flex flex-col gap-1 md:w-[30%]">
          <h3 className="payment-small-heading">{label}</h3>
          {description && <span className="payment-text">{description}</span>}
        </div>
        <div className="flex-1 flex">{children}</div>
      </div>
    </div>
  );
};

export default PaymentField;
