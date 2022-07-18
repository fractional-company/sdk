import { Provider } from '@ethersproject/abstract-provider';
import { Contract, Signer, BigNumberish } from 'ethers';
import { TransactionReceipt } from '@ethersproject/providers';
import { BaseVault } from './components';
import { isAddress } from 'ethers/lib/utils';
import { Token } from './types/types';
import { Chains, Proofs, Contracts, TokenStandards } from './common';
import { isValidChain, isValidAmount, isValidTokenStandard, executeTransaction } from './utils';

export class SDK {
  public readonly chainId: number;
  public readonly isReadOnly: boolean;
  private signerOrProvider: Signer | Provider;

  constructor({
    signerOrProvider,
    chainId = Chains.Mainnet
  }: {
    signerOrProvider: Signer | Provider;
    chainId: number;
  }) {
    if (!signerOrProvider) throw new Error('Signer or Provider is required');
    if (!isValidChain(chainId)) throw new Error(`Invalid chain id`);

    this.chainId = chainId;
    this.isReadOnly = !Signer.isSigner(signerOrProvider);
    this.signerOrProvider = signerOrProvider;
  }

  public async createVault({
    fractionSupply,
    modules,
    targets = [],
    selectors = []
  }: {
    fractionSupply: BigNumberish;
    modules: string[];
    targets?: string[];
    selectors?: string[];
  }): Promise<{
    vaultAddress: string;
    transactionHash: string;
  }> {
    this.#verifyIsNotReadOnly();

    // Fraction supply
    if (!isValidAmount(fractionSupply)) throw new Error(`Invalid fraction supply`);

    // Modules
    if (!Array.isArray(modules)) throw new Error(`Modules must be an array`);
    if (modules.length === 0) throw new Error(`Vault must have at least one module`);

    const moduleAddresses: string[] = [];
    const moduleNames: string[] = [];
    for (const moduleName of modules) {
      if (typeof moduleName !== 'string') throw new Error(`Module name must be a string`);
      const moduleContract = Contracts[moduleName];
      if (!moduleContract) throw new Error(`Module ${moduleName} does not exist`);
      const moduleAddress = moduleContract.address[this.chainId];
      moduleAddresses.push(moduleAddress);
      moduleNames.push(moduleName);
    }

    // Mint Proof
    const mintProofs = Proofs[moduleNames.join('_')];
    if (!mintProofs) throw new Error(`Combination of modules is not supported`);
    const mintProof = mintProofs[this.chainId];

    // Targets
    if (!Array.isArray(targets)) throw new Error(`Targets must be an array`);
    const targetAddresses: string[] = [];
    for (const targetName of targets) {
      if (typeof targetName !== 'string') throw new Error(`Target name must be a string`);
      const targetContract = Contracts[targetName];
      if (!targetContract) throw new Error(`Target ${targetName} does not exist`);
      const targetAddress = targetContract.address[this.chainId];
      targetAddresses.push(targetAddress);
    }

    // Selectors
    if (!Array.isArray(selectors)) throw new Error(`Selectors must be an array`);
    for (const selector of selectors) {
      if (typeof selector !== 'string') {
        throw new Error(`Selector must be a function signature string`);
      }
    }

    const baseVault = new BaseVault({
      signerOrProvider: this.signerOrProvider,
      chainId: this.chainId
    });

    const tx = await baseVault.deployVault(
      fractionSupply,
      moduleAddresses,
      targetAddresses,
      selectors,
      mintProof
    );

    return {
      vaultAddress: tx.logs[0].address,
      transactionHash: tx.transactionHash
    };
  }

  public depositTokens(from: string, to: string, tokens: Token[]): Promise<TransactionReceipt> {
    this.#verifyIsNotReadOnly();
    if (!isAddress(from)) throw new Error(`Invalid from address ${from}`);
    if (!isAddress(to)) throw new Error(`Invalid to address ${to}`);
    if (!Array.isArray(tokens)) throw new Error('Tokens must be an array');
    if (tokens.length === 0) throw new Error('Tokens array must not be empty');

    const erc20Data: {
      addresses: string[];
      amounts: BigNumberish[];
    } = {
      addresses: [],
      amounts: []
    };

    const erc721Data: {
      addresses: string[];
      ids: BigNumberish[];
    } = {
      addresses: [],
      ids: []
    };

    const erc1155Data: {
      addresses: string[];
      ids: BigNumberish[];
      amounts: BigNumberish[];
      datas: string[];
    } = {
      addresses: [],
      ids: [],
      amounts: [],
      datas: []
    };

    for (const token of tokens) {
      if (!isAddress(token.address)) throw new Error(`Invalid token address ${token.address}`);
      if (!isValidTokenStandard(token.standard))
        throw new Error(`Invalid token standard ${token.standard}`);

      const tokenStandard = token.standard.toUpperCase();
      switch (tokenStandard) {
        case TokenStandards.ERC20:
          if (!token.amount) throw new Error(`ERC20 token ${token.address} must have an amount`);
          erc20Data.addresses.push(token.address);
          erc20Data.amounts.push(token.amount);
          break;
        case TokenStandards.ERC721:
          if (!token.id) throw new Error(`ERC721 token ${token.address} must have a token id`);
          erc721Data.addresses.push(token.address);
          erc721Data.ids.push(token.id);
          break;
        case TokenStandards.ERC1155:
          if (!token.id) throw new Error(`ERC1155 token ${token.address} must have a token id`);
          if (!token.amount) throw new Error(`ERC1155 token ${token.address} must have an amount`);
          if (token.data && typeof token.data !== 'string')
            throw new Error(`ERC1155 token ${token.address} data must be a string`);

          erc1155Data.addresses.push(token.address);
          erc1155Data.ids.push(token.id);
          erc1155Data.amounts.push(token.amount);
          erc1155Data.datas.push(token.data || '0x');
          break;
        default:
          throw new Error(`Invalid token standard ${tokenStandard} for token ${token.address}`);
      }
    }

    const baseVaultABI = Contracts.BaseVault.ABI;
    const baseVaultAddress = Contracts.BaseVault.address[this.chainId];
    const baseVault = new Contract(baseVaultAddress, baseVaultABI, this.signerOrProvider);

    const encodedData: string[] = [];
    if (erc20Data.addresses.length > 0) {
      encodedData.push(
        baseVault.interface.encodeFunctionData('batchDepositERC20', [
          from,
          to,
          erc20Data.addresses,
          erc20Data.amounts
        ])
      );
    }

    if (erc721Data.addresses.length > 0) {
      encodedData.push(
        baseVault.interface.encodeFunctionData('batchDepositERC721', [
          from,
          to,
          erc721Data.addresses,
          erc721Data.ids
        ])
      );
    }

    if (erc1155Data.addresses.length > 0) {
      encodedData.push(
        baseVault.interface.encodeFunctionData('batchDepositERC1155', [
          from,
          to,
          erc1155Data.addresses,
          erc1155Data.ids,
          erc1155Data.amounts,
          erc1155Data.datas
        ])
      );
    }

    return executeTransaction({
      signerOrProvider: this.signerOrProvider,
      contract: baseVault,
      method: 'multicall',
      args: [encodedData]
    });
  }

  // Private methods
  #verifyIsNotReadOnly(): void {
    if (this.isReadOnly) {
      throw new Error('Method requires a signer');
    }
  }
}
