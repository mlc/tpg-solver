export const stringifyError = (error: unknown): string => {
  if (error instanceof Error) {
    return error.message;
  } else if (typeof error === 'object' && error !== null) {
    return error.toString();
  } else if (typeof error === 'string') {
    return error;
  } else {
    return 'Error';
  }
};
