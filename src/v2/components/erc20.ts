import { Contract, Signer, BigNumberish } from 'ethers';
import { Provider } from '@ethersproject/abstract-provider';
import { TransactionReceipt } from '@ethersproject/providers';
import { isAddress } from '@ethersproject/address';
import { isValidChain, executeTransaction } from '../utils';
import { abi, CHAINS } from '../common';

interface ERC20Config {
  address: string;
  signerOrProvider: Signer | Provider;
  chainId: number;
}

export class ERC20 {
  public address: string;
  private isReadOnly: boolean;
  private erc20: Contract;
  private signerOrProvider: Signer | Provider;

  constructor({ address, signerOrProvider, chainId = CHAINS.MAINNET }: ERC20Config) {
    if (!isAddress(address)) throw new Error('ERC20 contract address is not valid');
    if (!isValidChain(chainId)) throw new Error('Chain ID is not valid');

    this.address = address;
    this.isReadOnly = !Signer.isSigner(signerOrProvider);
    this.erc20 = new Contract(address, abi.erc20Abi, signerOrProvider);
    this.signerOrProvider = signerOrProvider;
  }

  public approve(spender: string, value: BigNumberish): Promise<TransactionReceipt> {
    this.verifyIsNotReadOnly();
    if (!isAddress(spender)) throw new Error(`Spender address ${spender} is not valid`);
    return executeTransaction({
      signerOrProvider: this.signerOrProvider,
      contract: this.erc20,
      method: 'approve',
      args: [spender, value]
    });
  }

  // Private methods
  private verifyIsNotReadOnly() {
    if (this.isReadOnly) {
      throw new Error('Method requires a signer');
    }
  }
}
