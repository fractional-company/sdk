import { BigNumber, BigNumberish } from 'ethers';

export function isValidAmount(amount: BigNumberish | undefined): boolean {
  if (amount === undefined) return false;

  try {
    const bigNumber = BigNumber.from(amount);
    return bigNumber.gte(0);
  } catch (e) {
    return false;
  }
}
