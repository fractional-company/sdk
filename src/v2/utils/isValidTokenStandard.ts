import { TokenStandard } from '../constants';

export function isValidTokenStandard(tokenStandard: string): boolean {
  if (typeof tokenStandard !== 'string') return false;
  return tokenStandard.toUpperCase() in TokenStandard;
}
