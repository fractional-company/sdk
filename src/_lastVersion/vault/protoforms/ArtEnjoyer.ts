import { Vault } from '../core/Vault';
import { LPDA } from '../distributions/LPDA';
import { OptimisticBid } from '../reconstitutions/OptimisticBid';

export const ArtEnjoyer = LPDA(OptimisticBid(Vault));
