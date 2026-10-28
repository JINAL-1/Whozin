import { useId } from 'react'
import './FormField.css'

// Labelled form control with optional hint and error text.
// as: 'input' (default) | 'textarea' | 'select'
// Any other props (type, value, onChange, required, children...) go to the control.
function FormField({
  id,
  label,
  hint,
  error,
  as: Control = 'input',
  className = '',
  ...controlProps
}) {
  const autoId = useId()
  const fieldId = id ?? autoId
  const hintId = hint ? `${fieldId}-hint` : undefined
  const errorId = error ? `${fieldId}-error` : undefined
  const describedBy = [hintId, errorId].filter(Boolean).join(' ') || undefined

  return (
    <div className={`field ${error ? 'field--invalid' : ''} ${className}`.trim()}>
      <label className="field__label" htmlFor={fieldId}>
        {label}
      </label>
      {hint && (
        <p className="field__hint" id={hintId}>
          {hint}
        </p>
      )}
      <Control
        id={fieldId}
        className="field__control"
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy}
        {...controlProps}
      />
      {error && (
        <p className="field__error" id={errorId}>
          {error}
        </p>
      )}
    </div>
  )
}

export default FormField
