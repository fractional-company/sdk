import { BigNumberish } from 'ethers';
export function isValidTimestamp(timestamp: BigNumberish): boolean {
  const num = Number(timestamp);
  return !Number.isNaN(num) && Number.isFinite(num) && num > 0;
}
