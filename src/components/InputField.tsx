import { FieldError, UseFormRegister } from "react-hook-form";
import React from "react";

type InputFieldProps = {
  label: string;
  type?: string;
  register: UseFormRegister<any>;
  name: string;
  defaultValue?: string;
  error?: FieldError;
  hidden?: boolean;
  inputProps?: React.InputHTMLAttributes<HTMLInputElement>;
  placeholder?: string;
  value?: string;
};

const InputField = ({
  label,
  type = "text",
  register,
  name,
  defaultValue = "",
  error,
  hidden,
  inputProps,
  placeholder = "",
  value,
}: InputFieldProps) => {
  return (
    <div className={hidden ? "hidden" : "flex flex-col gap-2 md:w-1/4"}>
      {/* Label */}
      <label
        htmlFor={name}
        className="text-xs font-medium text-gray-600 dark:text-gray-300"
      >
        {label}
      </label>

      {/* Input */}
      <input
        id={name}
        type={type}
        {...register(name)}
        defaultValue={defaultValue}
        placeholder={placeholder}
        value={value}
        {...inputProps}
        className={`
          w-full rounded-md px-3 py-2 text-sm outline-none transition
          bg-gray-100 text-gray-900 border
          dark:bg-[#1a2035] dark:text-gray-100 dark:border-white/10

          ${
            error
              ? "border-red-500 focus:ring-2 focus:ring-red-500"
              : "border-gray-300 focus:ring-2 focus:ring-LamaSky"
          }
        `}
      />

      {/* Error Message */}
      {error?.message && (
        <p className="text-xs text-red-500">{error.message}</p>
      )}
    </div>
  );
};

export default InputField;
