import { abi } from '../abi';
import { CHAINS } from './chains';

export const CONTRACTS = {
  [CHAINS.MAINNET]: {
    BASE_VAULT: {
      address: '0x0000000000000000000000000000000000000000',
      abi: abi.baseVaultAbi
    },
    BUYOUT: {
      address: '0x0000000000000000000000000000000000000000',
      abi: abi.buyoutAbi
    },
    FERC1155: {
      address: '0x0000000000000000000000000000000000000000',
      abi: abi.ferc1155Abi
    },
    MIGRATION: {
      address: '0x0000000000000000000000000000000000000000',
      abi: abi.migrationAbi
    },
    SUPPLY: {
      address: '0x0000000000000000000000000000000000000000',
      abi: abi.supplyAbi
    },
    TRANSFER: {
      address: '0x0000000000000000000000000000000000000000',
      abi: abi.transferAbi
    },
    VAULT: {
      address: '0x0000000000000000000000000000000000000000',
      abi: abi.vaultAbi
    },
    VAULT_FACTORY: {
      address: '0x0000000000000000000000000000000000000000',
      abi: abi.vaultFactoryAbi
    },
    VAULT_REGISTRY: {
      address: '0x0000000000000000000000000000000000000000',
      abi: abi.vaultRegistryAbi
    }
  },
  [CHAINS.RINKEBY]: {
    BASE_VAULT: {
      address: '0xec194Dee666725E512DBe2bf40306C7C9BCD4651',
      abi: abi.baseVaultAbi
    },
    BUYOUT: {
      address: '0x7003c79786f5Af5079699BA77DE9CB04cc569fD4',
      abi: abi.buyoutAbi
    },
    FERC1155: {
      address: '0x88a8c1e700D51746DE0d3BD8CA0aEF1912628656',
      abi: abi.ferc1155Abi
    },
    MIGRATION: {
      address: '0x6bb11960324d41d77Aaaf8C8c93c956A1F2345eA',
      abi: abi.migrationAbi
    },
    SUPPLY: {
      address: '0x88B8b0D1047caDD2B28AaEdf2fE2B863fe8885C2',
      abi: abi.supplyAbi
    },
    TRANSFER: {
      address: '0x4a92225796d01840AF1e07b8D872A046d0F08Edc',
      abi: abi.transferAbi
    },
    VAULT: {
      address: '0x63625DA7E523e716B1E317493Acd2b8d79e4230A',
      abi: abi.vaultAbi
    },
    VAULT_FACTORY: {
      address: '0x9BA1Ec3f27FA46c42ba49ba76Bd082dD6DAFAA20',
      abi: abi.vaultFactoryAbi
    },
    VAULT_REGISTRY: {
      address: '0x2580E23D6Bc9E23F5EF55563b1e3E5AFe2711689',
      abi: abi.vaultRegistryAbi
    }
  }
};
