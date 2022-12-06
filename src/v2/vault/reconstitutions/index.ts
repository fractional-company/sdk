import { Vault } from '../core/Vault';
import { OptimisticBidModule, OptimisticBidState, OptimisticBidInfo } from './OptimisticBid';

export const OptimisticBid = OptimisticBidModule(Vault);
export { OptimisticBidState, OptimisticBidInfo };
