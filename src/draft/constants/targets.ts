import { Contracts } from './contracts';
import { Variants } from './variants';
import { ContractConstant } from '../types/types';

export enum Targets {
  Supply = 'SUPPLY',
  Transfer = 'TRANSFER'
}

export const TargetContracts: ContractConstant = {
  [Targets.Supply]: Contracts.Supply,
  [Targets.Transfer]: Contracts.Transfer
};

export const Selectors = {
  [Targets.Supply]: {
    [Variants.Default]: {
      Burn: '0x9dc29fac',
      Mint: '0x40c10f19'
    },
    [Variants.Nounlets]: {
      BatchBurn: '0x7bad2380',
      Mint: '0x40c10f19'
    }
  },
  [Targets.Transfer]: {
    [Variants.Default]: {
      ERC1155BatchTransferFrom: '0x76aa79b2',
      ERC1155TransferFrom: '0x68e72e49',
      ERC721TransferFrom: '0x18c4eeed',
      ERC20Transfer: '0xe59fdd36'
    },
    [Variants.Nounlets]: {
      ERC1155BatchTransferFrom: '0x76aa79b2',
      ERC1155TransferFrom: '0x68e72e49',
      ERC20Transfer: '0xe59fdd36',
      ERC721TransferFrom: '0x18c4eeed'
    }
  }
};
