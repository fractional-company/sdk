import { Vault } from '../core/Vault';
import { LPDAInfo, LPDAModule, LPDAState } from './LPDA';

export const LPDA = LPDAModule(Vault);
export { LPDAInfo, LPDAState };
