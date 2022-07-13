import { Chains } from './chains';
import { Proof } from '../../types/types';

export const Proofs: {
  [key: string]: Proof;
} = {
  BaseVault: {
    [Chains.Mainnet]: [],
    [Chains.Rinkeby]: []
  },
  BaseVault_Buyout: {
    [Chains.Mainnet]: [''],
    [Chains.Rinkeby]: [
      '0xc0bc3c4ade9a477f1e49f7c2fd25e0e51b3ee163b9a2de7f8042b3e2a3c447b1',
      '0x1b506541849b0c823a05bf9c9e0f54449bcfc8ddb5b4187185fe7de9cf957e71',
      '0xa60754f6e8e806f7902b1927456d6dd2d91559a41a030e1de060b11c36f2df37'
    ]
  },
  BaseVault_Migration: {
    [Chains.Mainnet]: [''],
    [Chains.Rinkeby]: ['0x77083caa3528ccf71f58276672038507e6faf13bfb7d65eca911280dacc6be11']
  }
};
