import { Chains } from './chains';
import { ABI } from '../abi';

export const Contracts: {
  [key: string]: {
    address: {
      [key: number]: string;
    };
    ABI: any;
  };
} = {
  BaseVault: {
    address: {
      [Chains.Mainnet]: '0x0000000000000000000000000000000000000000',
      [Chains.Rinkeby]: '0xec194Dee666725E512DBe2bf40306C7C9BCD4651'
    },
    ABI: ABI.baseVault
  },
  Buyout: {
    address: {
      [Chains.Mainnet]: '0x0000000000000000000000000000000000000000',
      [Chains.Rinkeby]: '0x7003c79786f5Af5079699BA77DE9CB04cc569fD4'
    },
    ABI: ABI.buyout
  },
  FERC1155: {
    address: {
      [Chains.Mainnet]: '0x0000000000000000000000000000000000000000',
      [Chains.Rinkeby]: '0x88a8c1e700D51746DE0d3BD8CA0aEF1912628656'
    },
    ABI: ABI.ferc1155
  },
  Migration: {
    address: {
      [Chains.Mainnet]: '0x0000000000000000000000000000000000000000',
      [Chains.Rinkeby]: '0x6bb11960324d41d77Aaaf8C8c93c956A1F2345eA'
    },
    ABI: ABI.migration
  },
  Supply: {
    address: {
      [Chains.Mainnet]: '0x0000000000000000000000000000000000000000',
      [Chains.Rinkeby]: '0x88B8b0D1047caDD2B28AaEdf2fE2B863fe8885C2'
    },
    ABI: ABI.supply
  },
  Transfer: {
    address: {
      [Chains.Mainnet]: '0x0000000000000000000000000000000000000000',
      [Chains.Rinkeby]: '0x4a92225796d01840AF1e07b8D872A046d0F08Edc'
    },
    ABI: ABI.transfer
  },
  Vault: {
    address: {
      [Chains.Mainnet]: '0x0000000000000000000000000000000000000000',
      [Chains.Rinkeby]: '0x63625DA7E523e716B1E317493Acd2b8d79e4230A'
    },
    ABI: ABI.vault
  },
  VaultFactory: {
    address: {
      [Chains.Mainnet]: '0x0000000000000000000000000000000000000000',
      [Chains.Rinkeby]: '0x9BA1Ec3f27FA46c42ba49ba76Bd082dD6DAFAA20'
    },
    ABI: ABI.vaultFactory
  },
  VaultRegistry: {
    address: {
      [Chains.Mainnet]: '0x0000000000000000000000000000000000000000',
      [Chains.Rinkeby]: '0x2580E23D6Bc9E23F5EF55563b1e3E5AFe2711689'
    },
    ABI: ABI.vaultRegistry
  }
};
