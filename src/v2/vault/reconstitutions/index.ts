import { Vault } from '../core/Vault';
import { OptimisticBidModule } from './OptimisticBid';

export const OptimisticBid = OptimisticBidModule(Vault);
export * from './OptimisticBid';
