export const getParamString = (
  param: string | string[] | undefined
): string | undefined => {
  if (!param) return undefined;
  return Array.isArray(param) ? param[0] : param;
};