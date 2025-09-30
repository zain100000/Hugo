/**
 * InputField Component
 *
 * A flexible and reusable input field component that supports:
 * - Standard text/password/email inputs with floating labels
 * - Dropdown (select) inputs with floating labels
 * - Multiline textarea inputs
 *
 * Includes customizable props for styling, validation, and behavior.
 *
 * @component
 * @param {Object} props - Component props.
 * @param {string} [props.value] - Current value of the input field.
 * @param {function} props.onChange - Change handler for the input.
 * @param {string} [props.placeholder] - Placeholder text for the input.
 * @param {Object} [props.style] - Custom styles for the wrapper container.
 * @param {Object} [props.inputStyle] - Custom styles for the input element.
 * @param {boolean} [props.secureTextEntry=false] - If true, renders input type password.
 * @param {boolean} [props.editable=true] - Whether the input is editable.
 * @param {Array<{ value: string, label: string }>} [props.dropdownOptions] - Options for a dropdown input.
 * @param {string} [props.selectedValue] - Current value for dropdown selection.
 * @param {function} [props.onValueChange] - Change handler for dropdown selection.
 * @param {string} [props.bgColor] - Background color override for the input.
 * @param {string} [props.textColor] - Text color override for the input.
 * @param {string|number} [props.width] - Custom width for the input container.
 * @param {string} [props.label] - Floating label text or dropdown placeholder.
 * @param {string} [props.type="text"] - Input type (text, password, email, etc.).
 * @param {boolean} [props.fullWidth=false] - If true, input stretches full width.
 * @param {boolean} [props.required=false] - Whether input is required.
 * @param {boolean} [props.multiline=false] - If true, renders textarea.
 * @param {number} [props.rows=3] - Row count for textarea.
 */

import "../../styles/global.styles.css";
import "./InputField.utility.css";
import { useEffect, useRef } from "react";

const InputField = ({
  icon,
  value,
  onChange,
  placeholder,
  style,
  inputStyle,
  secureTextEntry,
  editable = true,
  dropdownOptions,
  selectedValue,
  onValueChange,
  bgColor,
  textColor,
  width,
  label,
  type,
  fullWidth = false,
  required = false,
  multiline = false,
  rows = 3,
}) => {
  const inputRef = useRef(null);

  // Handle browser autofill background override
  useEffect(() => {
    const handleAnimationStart = (e) => {
      if (
        e.animationName === "autoFillStart" ||
        e.animationName === "onAutoFillStart"
      ) {
        if (inputRef.current) {
          inputRef.current.style.backgroundColor = "transparent";
          inputRef.current.style.color = "var(--white)";
        }
      }
    };

    if (inputRef.current) {
      inputRef.current.addEventListener("animationstart", handleAnimationStart);
    }

    return () => {
      if (inputRef.current) {
        inputRef.current.removeEventListener(
          "animationstart",
          handleAnimationStart
        );
      }
    };
  }, []);

  return (
    <section id="input-field">
      <div
        className="custom-input-wrapper"
        style={{ ...style, width: fullWidth ? "100%" : width || "100%" }}
      >
        {/* Dropdown */}
        {dropdownOptions ? (
          <div
            className={`input-container ${selectedValue ? "has-value" : ""}`}
            style={{ width: "100%" }}
          >
            {icon && <span className="input-icon">{icon}</span>}
            <select
              className="custom-input dropdown-input"
              value={selectedValue}
              onChange={onValueChange}
              required={required}
              style={{
                backgroundColor: bgColor || "transparent",
                color: textColor || "var(--white)",
                width: "100%", // ✅ ensure dropdown uses wrapper width
                paddingLeft: icon ? "40px" : undefined,
                ...inputStyle,
              }}
            >
              <option value="" disabled hidden>
                {placeholder || label || "Select an option"}
              </option>
              {dropdownOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <label htmlFor={label} className="floating-label">
              {label}
            </label>
            <span className="dropdown-arrow">
              <i className="fas fa-chevron-down"></i>
            </span>
          </div>
        ) : multiline ? (
          /* Textarea */
          <div className="input-container no-float" style={{ width: "100%" }}>
            {icon && <span className="input-icon">{icon}</span>}
            <textarea
              ref={inputRef}
              value={value}
              onChange={onChange}
              placeholder={label || placeholder}
              required={required}
              rows={rows}
              className="custom-input"
              readOnly={!editable}
              style={{
                backgroundColor: bgColor || "transparent",
                color: textColor || "var(--white)",
                width: "100%",
                paddingLeft: icon ? "40px" : undefined,
                ...inputStyle,
              }}
            />
          </div>
        ) : (
          /* Standard input */
          <div
            className={`input-container ${value ? "has-value" : ""}`}
            style={{ width: "100%" }}
          >
            {icon && <span className="input-icon">{icon}</span>}
            <input
              ref={inputRef}
              id={label}
              value={value}
              onChange={onChange}
              placeholder={placeholder}
              type={type || (secureTextEntry ? "password" : "text")}
              className="custom-input"
              required={required}
              readOnly={!editable}
              style={{
                backgroundColor: bgColor || "transparent",
                color: textColor || "var(--white)",
                width: "100%",
                paddingLeft: icon ? "40px" : undefined,
                ...inputStyle,
              }}
              autoComplete="off"
            />
            <label htmlFor={label} className="floating-label">
              {label}
            </label>
          </div>
        )}
      </div>
    </section>
  );
};

export default InputField;
