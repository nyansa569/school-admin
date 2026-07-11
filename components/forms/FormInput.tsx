import styles from "./FormInput.module.css";
import React from "react";

/* =========================
   SVG ICONS
========================= */
const RequiredIcon = () => (
  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" />
    <line x1="12" y1="8" x2="12" y2="16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    <line x1="8" y1="12" x2="16" y2="12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
  </svg>
);

const ChevronDownIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M6 9L12 15L18 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

/* =========================
   BASE PROPS
========================= */
interface BaseProps {
  label?: string;
  required?: boolean;
  hint?: string;
  error?: string;
  icon?: React.ReactNode;
  className?: string;
  disabled?: boolean;
  placeholder?: string;
}

/* =========================
   TEXT INPUT (default)
========================= */
type TextInputProps = BaseProps & {
  type?:
    | "text"
    | "email"
    | "password"
    | "tel"
    | "number"
    | "date"
    | "time"
    | "datetime-local";
  value: string;
  onChange: (val: string) => void;
};

/* =========================
   FILE INPUT
========================= */
type FileInputProps = BaseProps & {
  type: "file";
  multiple?: boolean;
  onChange: (val: File | File[] | null) => void;
};

/* =========================
   UNION TYPE
========================= */
type InputProps = FileInputProps | TextInputProps;

/* =========================
   SELECT
========================= */
interface SelectProps extends BaseProps {
  value: string;
  onChange: (val: string) => void;
  options: { value: string; label: string }[];
}

/* =========================
   TEXTAREA
========================= */
interface TextareaProps extends BaseProps {
  value: string;
  onChange: (val: string) => void;
  rows?: number;
}

/* =========================
   INPUT COMPONENT
========================= */
export function FormInput(props: InputProps) {
  const {
    label,
    required,
    hint,
    error,
    icon,
    className,
    disabled,
    placeholder,
    type,
  } = props;

  const hasError = !!error;

  return (
    <div className={`${styles.group} ${className || ""}`}>
      {label && (
        <div className={styles.labelRow}>
          <label className={styles.label}>{label}</label>
          {required && (
            <span className={styles.requiredBadge}>
              <RequiredIcon />
              <span>Required</span>
            </span>
          )}
        </div>
      )}

      <div className={icon ? styles.inputWrapper : undefined}>
        {icon && <span className={styles.inputIcon}>{icon}</span>}

        {type === "file" ? (
          <div className={styles.fileWrapper}>
            <input
              type="file"
              multiple={props.multiple}
              className={`${styles.fileInput} ${hasError ? styles.error : ""}`}
              onChange={(e) => {
                if (props.multiple) {
                  props.onChange(
                    e.target.files ? Array.from(e.target.files) : []
                  );
                } else {
                  props.onChange(e.target.files?.[0] || null);
                }
              }}
              disabled={disabled}
            />
            <span className={styles.filePlaceholder}>
              {placeholder || "Choose file..."}
            </span>
          </div>
        ) : (
          <input
            type={type || "text"}
            className={`${styles.input} ${hasError ? styles.error : ""}`}
            value={props.value}
            onChange={(e) => props.onChange(e.target.value)}
            placeholder={placeholder}
            disabled={disabled}
          />
        )}
      </div>

      <div className={styles.feedback}>
        {hint && !error && <span className={styles.hint}>{hint}</span>}
        {error && <span className={styles.errorMsg}>{error}</span>}
      </div>
    </div>
  );
}

/* =========================
   SELECT
========================= */
export function FormSelect({
  label,
  required,
  hint,
  error,
  value,
  onChange,
  options,
  placeholder,
  className,
}: SelectProps) {
  const hasError = !!error;

  return (
    <div className={`${styles.group} ${className || ""}`}>
      {label && (
        <div className={styles.labelRow}>
          <label className={styles.label}>{label}</label>
          {required && (
            <span className={styles.requiredBadge}>
              <RequiredIcon />
              <span>Required</span>
            </span>
          )}
        </div>
      )}

      <div className={styles.selectWrapper}>
        <select
          className={`${styles.select} ${hasError ? styles.error : ""}`}
          value={value}
          onChange={(e) => onChange(e.target.value)}
        >
          {placeholder && <option value="">{placeholder}</option>}
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        <span className={styles.selectIcon}>
          <ChevronDownIcon />
        </span>
      </div>

      <div className={styles.feedback}>
        {hint && !error && <span className={styles.hint}>{hint}</span>}
        {error && <span className={styles.errorMsg}>{error}</span>}
      </div>
    </div>
  );
}

/* =========================
   TEXTAREA
========================= */
export function FormTextarea({
  label,
  required,
  hint,
  error,
  value,
  onChange,
  placeholder,
  rows = 3,
  className,
}: TextareaProps) {
  const hasError = !!error;

  return (
    <div className={`${styles.group} ${className || ""}`}>
      {label && (
        <div className={styles.labelRow}>
          <label className={styles.label}>{label}</label>
          {required && (
            <span className={styles.requiredBadge}>
              <RequiredIcon />
              <span>Required</span>
            </span>
          )}
        </div>
      )}

      <textarea
        className={`${styles.textarea} ${hasError ? styles.error : ""}`}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        rows={rows}
      />

      <div className={styles.feedback}>
        {hint && !error && <span className={styles.hint}>{hint}</span>}
        {error && <span className={styles.errorMsg}>{error}</span>}
      </div>
    </div>
  );
}

/* =========================
   ROW
========================= */
export function FormRow({
  children,
  cols = 2,
}: {
  children: React.ReactNode;
  cols?: 2 | 3;
}) {
  return (
    <div className={`${styles.row} ${cols === 2 ? styles.row2 : styles.row3}`}>
      {children}
    </div>
  );
}