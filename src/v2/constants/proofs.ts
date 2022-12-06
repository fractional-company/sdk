import { Chain } from './chains';
import { ART_ENJOYER_PROTOFORM, CHAINS } from '@fractional-company/common';

export const Proofs = {
  [Chain.Mainnet]: ART_ENJOYER_PROTOFORM.proofs[CHAINS.MAINNET],
  [Chain.Goerli]: ART_ENJOYER_PROTOFORM.proofs[CHAINS.GÖRLI]
};
