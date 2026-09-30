export function isPositiveInteger(value) {
  return Number.isInteger(value) && value > 0;
}

export function isValidId(value) {
  return /^\d+$/.test(String(value)) && Number(value) > 0;
}

export function isNonEmptyString(value) {
  return typeof value === 'string' && value.trim().length > 0;
}
