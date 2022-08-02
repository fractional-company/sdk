import { Chains } from './chains';
import { Variants } from './variants';
import { defaultABI, nounletsABI } from '../abi';
import { ContractConstant } from '../types/types';

export const Contracts: ContractConstant = {
  Auction: {
    [Variants.Nounlets]: {
      address: {
        [Chains.Mainnet]: '0x0',
        [Chains.Rinkeby]: '0xD28267Af71EfF64f0D38Ac3cf2c565Cd7F68d8CD'
      },
      ABI: nounletsABI.auction
    }
  },
  BaseVault: {
    [Variants.Default]: {
      address: {
        [Chains.Mainnet]: '0x0000000000000000000000000000000000000000',
        [Chains.Rinkeby]: '0xec194Dee666725E512DBe2bf40306C7C9BCD4651'
      },
      ABI: defaultABI.baseVault
    }
  },
  Buyout: {
    [Variants.Default]: {
      address: {
        [Chains.Mainnet]: '0x0000000000000000000000000000000000000000',
        [Chains.Rinkeby]: '0x7003c79786f5Af5079699BA77DE9CB04cc569fD4'
      },
      ABI: defaultABI.buyout
    },
    [Variants.Nounlets]: {
      address: {
        [Chains.Mainnet]: '0x0000000000000000000000000000000000000000',
        [Chains.Rinkeby]: '0x0000000000000000000000000000000000000000'
      },
      ABI: [] // todo: nounletsABI.buyout
    }
  },
  FERC1155: {
    [Variants.Default]: {
      address: {
        [Chains.Mainnet]: '0x0000000000000000000000000000000000000000',
        [Chains.Rinkeby]: '0x88a8c1e700D51746DE0d3BD8CA0aEF1912628656'
      },
      ABI: defaultABI.ferc1155
    },
    [Variants.Nounlets]: {
      address: {
        [Chains.Mainnet]: '0x0000000000000000000000000000000000000000',
        [Chains.Rinkeby]: '0x0000000000000000000000000000000000000000'
      },
      ABI: []
    }
  },
  ERC1155B: {
    [Variants.Nounlets]: {
      address: {
        [Chains.Mainnet]: '0x0000000000000000000000000000000000000000',
        [Chains.Rinkeby]: '0x8aaff821274F484fBdafe995f0aE0691CB60C58b'
      },
      ABI: nounletsABI.erc1155B
    }
  },
  Migration: {
    [Variants.Default]: {
      address: {
        [Chains.Mainnet]: '0x0000000000000000000000000000000000000000',
        [Chains.Rinkeby]: '0x6bb11960324d41d77Aaaf8C8c93c956A1F2345eA'
      },
      ABI: defaultABI.migration
    }
  },
  Supply: {
    [Variants.Default]: {
      address: {
        [Chains.Mainnet]: '0x0000000000000000000000000000000000000000',
        [Chains.Rinkeby]: '0x88B8b0D1047caDD2B28AaEdf2fE2B863fe8885C2'
      },
      ABI: defaultABI.supply
    },
    [Variants.Nounlets]: {
      address: {
        [Chains.Mainnet]: '0x0000000000000000000000000000000000000000',
        [Chains.Rinkeby]: '0xbFb1a36A03fc9Db7CEB680AbE838781e265AF478'
      },
      ABI: nounletsABI.supply
    }
  },
  Transfer: {
    [Variants.Default]: {
      address: {
        [Chains.Mainnet]: '0x0000000000000000000000000000000000000000',
        [Chains.Rinkeby]: '0x4a92225796d01840AF1e07b8D872A046d0F08Edc'
      },
      ABI: defaultABI.transfer
    },
    [Variants.Nounlets]: {
      address: {
        [Chains.Mainnet]: '0x0000000000000000000000000000000000000000',
        [Chains.Rinkeby]: '0xFA2C46c9C8Ea9Be03CbB9b2ADB607fBc654A00df'
      },
      ABI: nounletsABI.transfer
    }
  },
  Vault: {
    [Variants.Default]: {
      address: {
        [Chains.Mainnet]: '0x0000000000000000000000000000000000000000',
        [Chains.Rinkeby]: '0x63625DA7E523e716B1E317493Acd2b8d79e4230A'
      },
      ABI: defaultABI.vault
    },
    [Variants.Nounlets]: {
      address: {
        [Chains.Mainnet]: '0x0000000000000000000000000000000000000000',
        [Chains.Rinkeby]: '0xd3206fDd9D7817F18602D96208fb095eaa6b1247'
      },
      ABI: nounletsABI.vault
    }
  },
  VaultFactory: {
    [Variants.Default]: {
      address: {
        [Chains.Mainnet]: '0x0000000000000000000000000000000000000000',
        [Chains.Rinkeby]: '0x9BA1Ec3f27FA46c42ba49ba76Bd082dD6DAFAA20'
      },
      ABI: defaultABI.vaultFactory
    },
    [Variants.Nounlets]: {
      address: {
        [Chains.Mainnet]: '0x0000000000000000000000000000000000000000',
        [Chains.Rinkeby]: '0x1990e0829D485b88b469167C14E7fd356a2c4d11'
      },
      ABI: nounletsABI.vaultFactory
    }
  },
  VaultRegistry: {
    [Variants.Default]: {
      address: {
        [Chains.Mainnet]: '0x0000000000000000000000000000000000000000',
        [Chains.Rinkeby]: '0x2580E23D6Bc9E23F5EF55563b1e3E5AFe2711689'
      },
      ABI: defaultABI.vaultRegistry
    },
    [Variants.Nounlets]: {
      address: {
        [Chains.Mainnet]: '0x0000000000000000000000000000000000000000',
        [Chains.Rinkeby]: '0xCf9c28Cf382973eB18Ea10F4e402dBF519A7660b'
      },
      ABI: nounletsABI.vaultRegistry
    }
  }
};
