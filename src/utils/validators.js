export const parseId = (value) => Number.parseInt(value, 10);

export const isValidId = (value) => {
  const id = Number(value);
  return Number.isInteger(id) && id > 0;
};

export const isNonEmptyString = (value) =>
  typeof value === 'string' && value.trim().length > 0;