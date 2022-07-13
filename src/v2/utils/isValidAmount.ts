import { BigNumber, BigNumberish } from 'ethers';

export const isValidAmount = (amount: BigNumberish): boolean => {
  try {
    const bigNumber = BigNumber.from(amount);
    return bigNumber.gte(0);
  } catch (e) {
    return false;
  }
};
