export const NAME_REGEX = /^[a-zA-Z\s'-]+$/

export const PHONE_REGEX = /^\+?[\d\s-]{7,15}$/

export const TEXT_REGEX = /^[a-zA-Z0-9\s.,&()-]+$/

export const ALPHANUMERIC_REGEX = /^[a-zA-Z0-9\s]+$/

export function validateName(value, field = 'Name') {
  if (!value || !value.trim()) return `${field} is required`
  if (!NAME_REGEX.test(value)) return `${field} cannot contain special characters or numbers`
  if (value.trim().length < 2) return `${field} must be at least 2 characters`
  return ''
}

export function validatePhone(value) {
  if (!value || !value.trim()) return 'Phone number is required'
  if (!PHONE_REGEX.test(value)) return 'Enter a valid phone number (e.g. +250788123456)'
  return ''
}

export function validateText(value, field = 'Field') {
  if (!value || !value.trim()) return `${field} is required`
  if (!TEXT_REGEX.test(value)) return `${field} contains invalid characters`
  return ''
}

export function validateProductName(value) {
  if (!value || !value.trim()) return 'Product name is required'
  if (!ALPHANUMERIC_REGEX.test(value)) return 'Product name cannot contain special characters'
  return ''
}

export function validatePositiveNumber(value, field = 'Value') {
  if (!value || value === '') return `${field} is required`
  const num = parseFloat(value)
  if (isNaN(num) || num <= 0) return `${field} must be a positive number`
  return ''
}

export function validateDate(value) {
  if (!value) return 'Date is required'
  const date = new Date(value)
  if (isNaN(date.getTime())) return 'Invalid date'
  return ''
}

export function validateRequired(value, field = 'Field') {
  if (!value || (typeof value === 'string' && !value.trim())) return `${field} is required`
  return ''
}
