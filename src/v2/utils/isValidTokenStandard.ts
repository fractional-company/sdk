import { TokenStandards } from '../common';

export function isValidTokenStandard(tokenStandard: string): boolean {
  if (typeof tokenStandard !== 'string') return false;
  return Object.values(TokenStandards).includes(tokenStandard.toUpperCase());
}
