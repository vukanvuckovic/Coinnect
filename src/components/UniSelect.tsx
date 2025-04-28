import React from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";

interface UniSelectProps<T> {
  dataTestTrigger?: string;
  dataTestOption?: string;
  value: T | undefined;
  setValue: React.Dispatch<React.SetStateAction<T | undefined>>;
  icon?: React.ReactNode;
  placeholder: string;
  options: { title: string; value: T }[];
  onChange?: (value: T) => void;
  className?: string;
}

// Radix Select requires string values. These helpers serialize/deserialize
// any value type (including objects like Template) to/from strings.
const serialize = <T,>(v: T): string => {
  if (typeof v === "string") return v;
  if (typeof v === "number" || typeof v === "boolean") return String(v);
  return JSON.stringify(v);
};

const UniSelect = <T,>({
  dataTestTrigger,
  dataTestOption,
  value,
  setValue,
  icon,
  placeholder,
  options,
  onChange,
  className = "",
}: UniSelectProps<T>) => {
  const isDisabled = options.length === 0;

  const handleChange = (serialized: string) => {
    const matched = options.find((o) => serialize(o.value) === serialized);
    const resolved = matched ? matched.value : (serialized as unknown as T);
    setValue(resolved);
    onChange?.(resolved);
  };

  return (
    <Select
      value={value !== undefined ? serialize(value) : undefined}
      onValueChange={handleChange}
      disabled={isDisabled}
    >
      <SelectTrigger
        data-test={dataTestTrigger}
        className={
          "flex items-center justify-between w-full !outline-none !ring-0 !ring-transparent " +
          className
        }
      >
        <div className="flex items-center gap-2">
          {icon}
          <SelectValue
            placeholder={isDisabled ? "No options available" : placeholder}
          />
        </div>
      </SelectTrigger>
      <SelectContent className="!outline-none !ring-0 border-gray-200">
        {isDisabled ? (
          <div className="px-3 py-2 text-sm text-muted-foreground">
            No options available.
          </div>
        ) : (
          options.map((item, index) => (
            <SelectItem
              data-test={dataTestOption}
              key={index}
              value={serialize(item.value)}
            >
              {item.title}
            </SelectItem>
          ))
        )}
      </SelectContent>
    </Select>
  );
};

export default UniSelect;
