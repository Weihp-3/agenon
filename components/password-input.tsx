"use client";

import { useState, type InputHTMLAttributes } from "react";
import { Icon } from "./icon";

/**
 * Input kata sandi dengan tombol mata untuk beralih antara teks tersembunyi
 * dan terlihat. Digunakan di login, daftar, dan atur ulang kata sandi.
 */
export function PasswordInput({
  label,
  id,
  wrapperClassName = "",
  ...props
}: Omit<InputHTMLAttributes<HTMLInputElement>, "type"> & {
  label: string;
  id: string;
  wrapperClassName?: string;
}) {
  const [visible, setVisible] = useState(false);

  return (
    <div className={wrapperClassName}>
      <label htmlFor={id} className="field-label">
        {label}
      </label>
      <div className="relative">
        <input
          {...props}
          id={id}
          type={visible ? "text" : "password"}
          className="field pr-11"
        />
        <button
          type="button"
          onClick={() => setVisible((v) => !v)}
          className="absolute inset-y-0 right-0 flex h-full w-11 items-center justify-center rounded-r-md text-ink-subtle transition-colors hover:text-ink focus-visible:text-brand"
          aria-label={visible ? "Sembunyikan kata sandi" : "Tampilkan kata sandi"}
          aria-pressed={visible}
          tabIndex={0}
        >
          <Icon
            name={visible ? "eyeSlash" : "eye"}
            className="h-5 w-5"
          />
        </button>
      </div>
    </div>
  );
}
