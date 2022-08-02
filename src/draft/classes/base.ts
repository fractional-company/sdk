import { Signer } from 'ethers';
import { Variants } from '../constants';
import { Connection, Options } from '../types/types';

export default class Base {
  public readonly chainId: number;
  public readonly variant: Variants;
  public readonly isReadOnly: boolean;
  public readonly connection: Connection;

  constructor(connection: Connection, options: Options) {
    this.variant = options.variant;
    this.chainId = options.chainId;
    this.connection = connection;
    this.isReadOnly = !Signer.isSigner(connection);
  }

  public verifyIsNotReadOnly(): void {
    if (this.isReadOnly) {
      throw new Error('Method requires a signer');
    }
  }
}
