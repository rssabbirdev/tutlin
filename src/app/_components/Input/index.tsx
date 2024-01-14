import React from 'react'
import { FieldValues, UseFormRegister, Validate } from 'react-hook-form'

import classes from './index.module.scss'

type Props = {
  name: string
  label: string
  register: UseFormRegister<FieldValues & any>
  required?: boolean
  error: any
  type?: 'text' | 'number' | 'password' | 'email'
  validate?: (value: string) => boolean | string
  disabled?: boolean
  placeholder?: string
  hideLabel?: boolean
  errorMsg?: string
  maxLength?: number
  maxLengthErrorMsg?: string
  minLength?: number
  minLengthErrorMsg?: string
  defaultValue?: string
}

export const Input: React.FC<Props> = ({
  name,
  label,
  required,
  register,
  error,
  type = 'text',
  validate,
  disabled,
  placeholder,
  hideLabel,
  errorMsg,
  maxLength,
  maxLengthErrorMsg,
  minLength,
  minLengthErrorMsg,
  defaultValue,
}) => {
  return (
    <div className={classes.inputWrap}>
      <label htmlFor="name" className={classes.label}>
        {!hideLabel && label}
        {!hideLabel && required ? <span className={classes.asterisk}>&nbsp;*</span> : ''}
      </label>

      <input
        defaultValue={defaultValue}
        className={[classes.input, error && classes.error].filter(Boolean).join(' ')}
        {...{ type }}
        {...register(name, {
          required: {
            value: required,
            message: errorMsg ? `${errorMsg}` : 'This field is required',
          },
          minLength: {
            value: minLength ? minLength : 3,
            message: minLengthErrorMsg ? minLengthErrorMsg : 'নুন্যতম ৩ অক্ষরে লিখতে হবে',
          },
          maxLength: {
            value: maxLength ? maxLength : 100,
            message: maxLengthErrorMsg ? `${maxLengthErrorMsg}` : '১০০ অক্ষরের বেশি লিখা যাবে নাহ',
          },
          validate,
          ...(type === 'email'
            ? {
                pattern: {
                  value: /\S+@\S+\.\S+/,
                  message: 'Please enter a valid email',
                },
              }
            : {}),
        })}
        placeholder={placeholder}
        disabled={disabled}
      />
      {error && (
        <div className={classes.errorMessage}>
          {!error?.message && error?.type === 'required'
            ? 'This field is required'
            : error?.message}
        </div>
      )}
    </div>
  )
}
