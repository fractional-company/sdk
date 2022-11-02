import { proofs } from '../proofs/proofs';
import { Chain } from './chains';

export const Proofs = {
  [Chain.Mainnet]: proofs?.[Chain.Goerli], // todo: change to Mainnet
  [Chain.Goerli]: proofs?.[Chain.Goerli]
};
