import { BigNumberish } from 'ethers';
import { parseEther } from 'ethers/lib/utils';

export function isNonNegativeEther(value: BigNumberish): boolean {
  try {
    const parsed = parseEther(value.toString());
    return parsed.gte(0);
  } catch (e) {
    return false;
  }
}
