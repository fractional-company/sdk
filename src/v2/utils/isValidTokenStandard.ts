import { TOKEN_STANDARDS } from '../common';

export function isValidTokenStandard(tokenStandard: string): boolean {
  if (typeof tokenStandard !== 'string') return false;
  return Object.values(TOKEN_STANDARDS).includes(tokenStandard.toUpperCase());
}
