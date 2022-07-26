import { Chains } from './chains';
import { Proof } from '../../types/types';

export const Proofs: {
  [key: string]: {
    [key: number]: Proof;
  };
} = {
  BaseVault: {
    [Chains.Mainnet]: [],
    [Chains.Rinkeby]: []
  },
  BaseVault_Buyout: {
    [Chains.Mainnet]: [[''], ['']],
    [Chains.Rinkeby]: [
      [
        '0xc0bc3c4ade9a477f1e49f7c2fd25e0e51b3ee163b9a2de7f8042b3e2a3c447b1',
        '0x1b506541849b0c823a05bf9c9e0f54449bcfc8ddb5b4187185fe7de9cf957e71',
        '0xa60754f6e8e806f7902b1927456d6dd2d91559a41a030e1de060b11c36f2df37'
      ],
      [
        '0xb2ebcbe338068aa895187dd9336d5ae6ef9550f98162f0571cc1961e91dd668f',
        '0x1b506541849b0c823a05bf9c9e0f54449bcfc8ddb5b4187185fe7de9cf957e71',
        '0xa60754f6e8e806f7902b1927456d6dd2d91559a41a030e1de060b11c36f2df37'
      ],
      [
        '0xc7e61630740a36077d36eec11c063bb82ab5142b47cacffeddf61377ae11f343',
        '0x8849d6f5291dfc75b37d5c844dd2d9ef8d742f04105678eadaa1ee5c0846836b',
        '0xa60754f6e8e806f7902b1927456d6dd2d91559a41a030e1de060b11c36f2df37'
      ],
      [
        '0xdab22719df91b9921650c4b7b19f1113acd897c3d4c7420cc46cbf94caaac194',
        '0x8849d6f5291dfc75b37d5c844dd2d9ef8d742f04105678eadaa1ee5c0846836b',
        '0xa60754f6e8e806f7902b1927456d6dd2d91559a41a030e1de060b11c36f2df37'
      ],
      [
        '0x316d1415040e198e89ed31e105626962afc4920486dc240700ab49ba07b1beb3',
        '0x62124cd9019daac3433a84d319d25a8de3a08bf1b4233453a99de960ea947fdd'
      ],
      [
        '0x0adc282b457d19a505033c9a1be2837c30b3fff681c542ba4fbaa7716861a9de',
        '0x62124cd9019daac3433a84d319d25a8de3a08bf1b4233453a99de960ea947fdd'
      ]
    ]
  },
  BaseVault_Migration: {
    [Chains.Mainnet]: [[''], ['']],
    [Chains.Rinkeby]: [
      ['0x77083caa3528ccf71f58276672038507e6faf13bfb7d65eca911280dacc6be11'],
      ['0xb2ebcbe338068aa895187dd9336d5ae6ef9550f98162f0571cc1961e91dd668f']
    ]
  },
  BaseVault_Buyout_Migration: {
    [Chains.Mainnet]: [[''], ['']],
    [Chains.Rinkeby]: [
      [
        '0xc0bc3c4ade9a477f1e49f7c2fd25e0e51b3ee163b9a2de7f8042b3e2a3c447b1',
        '0x1b506541849b0c823a05bf9c9e0f54449bcfc8ddb5b4187185fe7de9cf957e71',
        '0x61c370d5c2b7dfb7943633948f90639f45de28fcd2d48d1f7bfb009ec805a6ea'
      ],
      [
        '0xb2ebcbe338068aa895187dd9336d5ae6ef9550f98162f0571cc1961e91dd668f',
        '0x1b506541849b0c823a05bf9c9e0f54449bcfc8ddb5b4187185fe7de9cf957e71',
        '0x61c370d5c2b7dfb7943633948f90639f45de28fcd2d48d1f7bfb009ec805a6ea'
      ],
      [
        '0xc7e61630740a36077d36eec11c063bb82ab5142b47cacffeddf61377ae11f343',
        '0x8849d6f5291dfc75b37d5c844dd2d9ef8d742f04105678eadaa1ee5c0846836b',
        '0x61c370d5c2b7dfb7943633948f90639f45de28fcd2d48d1f7bfb009ec805a6ea'
      ],
      [
        '0xdab22719df91b9921650c4b7b19f1113acd897c3d4c7420cc46cbf94caaac194',
        '0x8849d6f5291dfc75b37d5c844dd2d9ef8d742f04105678eadaa1ee5c0846836b',
        '0x61c370d5c2b7dfb7943633948f90639f45de28fcd2d48d1f7bfb009ec805a6ea'
      ],
      [
        '0x316d1415040e198e89ed31e105626962afc4920486dc240700ab49ba07b1beb3',
        '0x77083caa3528ccf71f58276672038507e6faf13bfb7d65eca911280dacc6be11',
        '0x62124cd9019daac3433a84d319d25a8de3a08bf1b4233453a99de960ea947fdd'
      ],
      [
        '0x0adc282b457d19a505033c9a1be2837c30b3fff681c542ba4fbaa7716861a9de',
        '0x77083caa3528ccf71f58276672038507e6faf13bfb7d65eca911280dacc6be11',
        '0x62124cd9019daac3433a84d319d25a8de3a08bf1b4233453a99de960ea947fdd'
      ],
      [
        '0xa60754f6e8e806f7902b1927456d6dd2d91559a41a030e1de060b11c36f2df37',
        '0x62124cd9019daac3433a84d319d25a8de3a08bf1b4233453a99de960ea947fdd'
      ]
    ]
  }
};
