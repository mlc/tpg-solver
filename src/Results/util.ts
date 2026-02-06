export const stringify = (p: unknown) => {
  if (typeof p === 'string') {
    return p;
  } else if (typeof p === 'number') {
    return p.toString();
  } else {
    return '';
  }
};
