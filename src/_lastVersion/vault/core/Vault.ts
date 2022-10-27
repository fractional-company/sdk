import { Signer } from 'ethers';
import { isAddress } from 'ethers/lib/utils';
import { Chain, Contract } from '../../constants';
import { VaultRegistry__factory as VaultRegistryFactory } from '../../contracts';
import { Connection } from '../../types/types';
import { getContractAddress, isValidChain, isValidConnection } from '../../utils';

export type Constructor<T = Vault> = new (...args: any[]) => T;

export class Vault {
  public chainId: Chain;
  public vaultAddress: string;
  public isReadOnly: boolean;
  public connection: Connection;

  constructor(vaultAddress: string, connection: Connection, chainId: Chain) {
    if (!isAddress(vaultAddress)) throw new Error('Invalid vault address');
    if (!isValidConnection(connection)) throw new Error('Invalid signer or provider');
    if (!isValidChain(chainId)) throw new Error('Invalid chain ID');

    this.vaultAddress = vaultAddress;
    this.chainId = chainId;
    this.connection = connection;
    this.isReadOnly = !Signer.isSigner(connection);
  }

  public async getTokenInfo(): Promise<{
    tokenAddress: string;
    tokenId: string;
  }> {
    const vaultRegistryAddress = getContractAddress(Contract.VaultRegistry, this.chainId);
    const vaultRegistry = VaultRegistryFactory.connect(vaultRegistryAddress, this.connection);
    const info = await vaultRegistry.vaultToToken(this.vaultAddress);

    return {
      tokenAddress: info.token,
      tokenId: info.id.toString()
    };
  }
}
