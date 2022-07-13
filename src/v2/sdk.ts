import { Provider } from '@ethersproject/abstract-provider';
import { Signer, BigNumberish } from 'ethers';
import { BaseVault } from './components';
import { isValidChain, isValidAmount } from './utils';
import { Chains, Proofs, Contracts } from './common';

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

  // Private methods
  #verifyIsNotReadOnly(): void {
    if (this.isReadOnly) {
      throw new Error('Method requires a signer');
    }
  }
}
