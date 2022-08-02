import { Contracts } from './contracts';
import { ContractConstant } from '../types/types';

export enum Modules {
  Base = 'BASE',
  Buyout = 'BUYOUT',
  Migration = 'MIGRATION'
}

export const ModulesContracts: ContractConstant = {
  [Modules.Base]: Contracts.BaseVault,
  [Modules.Buyout]: Contracts.Buyout,
  [Modules.Migration]: Contracts.Migration
};
