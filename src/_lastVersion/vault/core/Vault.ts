import { Signer } from 'ethers';
import { isAddress } from 'ethers/lib/utils';
import { Chain } from '../../constants';
import { Connection } from '../../types/types';

export type Constructor<T = Vault> = new (...args: any[]) => T;

export class Vault {
  public chainId: Chain;
  public connection: Connection;
  public isReadOnly: boolean;
  public vaultAddress: string;

  constructor(vaultAddress: string, connection: Connection, chainId: Chain) {
    if (!isAddress(vaultAddress)) throw new Error('Invalid vault address');

    this.vaultAddress = vaultAddress;
    this.chainId = chainId;
    this.connection = connection;
    this.isReadOnly = !Signer.isSigner(connection);
  }

  public verifyIsNotReadOnly(): void {
    if (this.isReadOnly) {
      throw new Error('Cannot write to read-only connection');
    }
  }
}
