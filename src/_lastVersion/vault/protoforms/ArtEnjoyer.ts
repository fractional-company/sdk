import { Vault } from '../core/Vault';
import { LPDAModule } from '../distributions/LPDA';
import { OptimisticBidModule } from '../reconstitutions/OptimisticBid';

export const ArtEnjoyer = LPDAModule(OptimisticBidModule(Vault));
