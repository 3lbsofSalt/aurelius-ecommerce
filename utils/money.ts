export const roundToNextCent = (money: number) => { 
  return (Math.ceil(money * 100) / 100);
}
