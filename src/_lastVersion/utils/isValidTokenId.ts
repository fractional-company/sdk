import { BigNumberish } from 'ethers';

export function isValidTokenId(id: BigNumberish): boolean {
  if (typeof id !== 'string' && typeof id !== 'number') {
    return false;
  }

  const numId = Number(id);

  if (isNaN(numId)) {
    return false;
  }

  if (Number.isInteger(numId) && numId > 0) {
    return true;
  } else {
    return false;
  }
}
