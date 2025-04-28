import React from "react";

interface FormInputProps {
  dataTest?: string;
  label: string;
  type?: "date" | "text" | "email" | "password" | "number";
  className?: string;
  placeholder: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const FormInput = ({
  dataTest,
  label,
  type = "text",
  className,
  placeholder,
  value,
  onChange,
}: FormInputProps) => {
  return (
    <div className="flex-1 flex flex-col gap-1">
      <span className="input-label">{label}</span>
      <input
        data-test={dataTest}
        value={value}
        onChange={onChange}
        type={type}
        className={`payment-input ${className ?? ""}`}
        placeholder={placeholder}
      />
    </div>
  );
};

export default FormInput;
