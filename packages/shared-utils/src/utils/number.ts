export const isNumber = (value: any): boolean => {
  return (
    value !== null &&
    value !== undefined &&
    !isNaN(parseFloat(value)) &&
    isFinite(value)
  );
};

export const randomNumberString = (length:number):string => {
  return Math.random().toString().slice(2,2 + length);
}