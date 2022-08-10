import { parseEther } from 'ethers/lib/utils';

export function isNonNegativeEther(value: string): boolean {
  try {
    const bigNumber = parseEther(value);
    return bigNumber.gte(0);
  } catch (e) {
    return false;
  }
}
