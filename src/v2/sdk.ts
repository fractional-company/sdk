import { Provider } from '@ethersproject/abstract-provider';
import { Contract, Signer, BigNumberish, BigNumber } from 'ethers';
import { TransactionReceipt } from '@ethersproject/providers';
import { isAddress, parseEther } from 'ethers/lib/utils';
import { BaseVault, Buyout, FERC1155 } from './components';
import { Token, AuctionState } from './types/types';
import { Chains, Contracts, TokenStandards } from './common';
import {
  isNonNegativeEther,
  isValidChain,
  isValidAmount,
  isValidTokenStandard,
  executeTransaction,
  getCurrentWallet,
  getPermitSignature,
  getProofsByAddress,
  getProofsByModules,
  getVaultId
} from './utils';

export class SDK {
  public readonly chainId: number;
  public readonly isReadOnly: boolean;
  private readonly signerOrProvider: Signer | Provider;

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
    if (!isValidAmount(fractionSupply))
      throw new Error(`Supply must be an integer greater than or equal to zero`);

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
    const proofs = getProofsByModules(moduleNames, this.chainId);
    const mintProof = proofs[0];

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

  public async depositTokens(
    from: string,
    to: string,
    tokens: Token[]
  ): Promise<TransactionReceipt> {
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
        throw new Error(`Invalid token standard ${token.standard} for token ${token.address}`);

      const tokenStandard = token.standard.toUpperCase();
      switch (tokenStandard) {
        case TokenStandards.ERC20:
          if (token.amount === undefined || !isNonNegativeEther(token.amount))
            throw new Error(`ERC20 token ${token.address} must have a valid amount`);
          erc20Data.amounts.push(parseEther(token.amount));
          erc20Data.addresses.push(token.address);
          break;
        case TokenStandards.ERC721:
          if (token.id === undefined || !isValidAmount(token.id))
            throw new Error(`ERC721 token ${token.address} must have a valid token id`);
          erc721Data.addresses.push(token.address);
          erc721Data.ids.push(token.id);
          break;
        case TokenStandards.ERC1155:
          if (token.id === undefined || !isValidAmount(token.id))
            throw new Error(`ERC1155 token ${token.address} must have a valid token id`);
          if (token.amount === undefined || !isValidAmount(token.amount))
            throw new Error(`ERC1155 token ${token.address} must have a valid amount`);
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

  public async redeem(vaultAddress: string): Promise<TransactionReceipt> {
    this.#verifyIsNotReadOnly();
    if (!isAddress(vaultAddress)) throw new Error(`Invalid vault address ${vaultAddress}`);

    // FERC1155 Contract
    const ferc1155ABI = Contracts.FERC1155.ABI;
    const ferc1155Address = Contracts.FERC1155.address[this.chainId];
    const ferc1155 = new Contract(ferc1155Address, ferc1155ABI, this.signerOrProvider);

    // Buyout Module Contract
    const buyoutModuleABI = Contracts.Buyout.ABI;
    const buyoutModuleAddress = Contracts.Buyout.address[this.chainId];
    const buyoutModule = new Contract(buyoutModuleAddress, buyoutModuleABI, this.signerOrProvider);

    // Validate buyout state
    const buyoutInfo: { state: number } = await buyoutModule.functions.buyoutInfo(vaultAddress);
    if (!buyoutInfo) throw new Error(`Vault ${vaultAddress} does not exist`);
    if (buyoutInfo.state === AuctionState.live)
      throw new Error(`Cannot redeem tokens during a an active buyout`);
    if (buyoutInfo.state === AuctionState.success)
      throw new Error(`Cannot redeem tokens from a closed vault`);

    // Get proofs
    const proofs = await getProofsByAddress(vaultAddress, this.signerOrProvider);
    const burnProof = proofs[1];

    // Get signature
    const signature = await getPermitSignature(
      buyoutModuleAddress,
      ferc1155,
      this.signerOrProvider
    );

    const selfPermitAllData = buyoutModule.interface.encodeFunctionData('selfPermitAll', [
      ferc1155Address,
      signature.approved,
      signature.deadline,
      signature.v,
      signature.r,
      signature.s
    ]);

    const redeemData = buyoutModule.interface.encodeFunctionData('redeem', [
      vaultAddress,
      burnProof
    ]);

    const encodedData = [selfPermitAllData, redeemData];

    return executeTransaction({
      signerOrProvider: this.signerOrProvider,
      contract: buyoutModule,
      method: 'multicall',
      args: [encodedData]
    });
  }

  public async startAuction(vaultAddress: string, amount: string): Promise<TransactionReceipt> {
    this.#verifyIsNotReadOnly();

    if (!isAddress(vaultAddress)) throw new Error(`Vault address ${vaultAddress} is not valid`);
    if (!isNonNegativeEther(amount))
      throw new Error(`Amount must be greater than or equal to zero`);

    // FERC1155 Contract
    const ferc1155 = new FERC1155({
      signerOrProvider: this.signerOrProvider,
      chainId: this.chainId
    });

    // Buyout Module Contract
    const buyoutModule = new Buyout({
      signerOrProvider: this.signerOrProvider,
      chainId: this.chainId
    });

    // Validate that vault is not already live or closed
    const buyoutInfo = await buyoutModule.buyoutInfo(vaultAddress);
    if (!buyoutInfo) throw new Error(`Vault ${vaultAddress} does not exist`);
    if (buyoutInfo.state === AuctionState.live)
      throw new Error(`There is already an active buyout for this vault`);
    if (buyoutInfo.state === AuctionState.success)
      throw new Error(`Cannot start a buyout auction on a closed vault`);

    // Validate that user has sufficient balance
    const wallet = await getCurrentWallet(this.signerOrProvider);
    if (wallet.balance.lte(parseEther(amount))) {
      throw new Error(
        `Insufficient funds. Auction bid is ${amount} ETH. Your balance is ${wallet.balance.toString()} ETH.`
      );
    }

    // Validate that user has more than zero tokens and less than the total supply
    const vaultId = await getVaultId(vaultAddress, this.signerOrProvider);
    const balance = await ferc1155.balanceOf(wallet.address, vaultId);
    const totalSupply = await ferc1155.totalSupply(vaultId);

    if (balance.isZero()) {
      throw new Error(`You don't own any tokens from this vault`);
    }

    if (balance.eq(totalSupply)) {
      throw new Error(`Cannot start a buyout auction if you own all the tokens`);
    }

    // Check approval status. If not approved, approve the token.
    const isApprovedForAll = await ferc1155.isApprovedForAll(wallet.address, buyoutModule.address);
    if (!isApprovedForAll) {
      await ferc1155.setApprovalForAll(buyoutModule.address, true);
    }

    return buyoutModule.start(vaultAddress, amount);
  }

  public async endAuction(vaultAddress: string): Promise<TransactionReceipt> {
    this.#verifyIsNotReadOnly();
    if (!isAddress(vaultAddress)) throw new Error(`Vault address ${vaultAddress} is not valid`);

    // FERC1155 Contract
    const ferc1155ABI = Contracts.FERC1155.ABI;
    const ferc1155Address = Contracts.FERC1155.address[this.chainId];
    const ferc1155 = new Contract(ferc1155Address, ferc1155ABI, this.signerOrProvider);

    // Buyout Module Contract
    const buyoutModuleABI = Contracts.Buyout.ABI;
    const buyoutModuleAddress = Contracts.Buyout.address[this.chainId];
    const buyoutModule = new Contract(buyoutModuleAddress, buyoutModuleABI, this.signerOrProvider);

    // Validate buyout state
    const buyoutInfo: { state: number; startTime: BigNumber } =
      await buyoutModule.functions.buyoutInfo(vaultAddress);
    if (!buyoutInfo) throw new Error(`Vault ${vaultAddress} does not exist`);
    if (buyoutInfo.state === AuctionState.inactive) throw new Error(`Buyout auction is not active`);
    if (buyoutInfo.state === AuctionState.success)
      throw new Error(`Buyout auction is already closed`);

    // Validate that rejection has ended
    const period: [BigNumber] = await buyoutModule.functions.REJECTION_PERIOD();
    const auctionEnd = period[0].toNumber() + buyoutInfo.startTime.toNumber(); // unix timestamp in seconds
    const now = Math.floor(Date.now() / 1000);
    if (now < auctionEnd) {
      throw new Error(`Cannot end auction before the rejection period has ended`);
    }

    // Get proofs
    const proofs = await getProofsByAddress(vaultAddress, this.signerOrProvider);
    const burnProof = proofs[1];

    const signature = await getPermitSignature(
      buyoutModuleAddress,
      ferc1155,
      this.signerOrProvider
    );

    const selfPermitAllData = buyoutModule.interface.encodeFunctionData('selfPermitAll', [
      ferc1155Address,
      signature.approved,
      signature.deadline,
      signature.v,
      signature.r,
      signature.s
    ]);

    const endData = buyoutModule.interface.encodeFunctionData('end', [vaultAddress, burnProof]);

    const encodedData = [selfPermitAllData, endData];

    return executeTransaction({
      signerOrProvider: this.signerOrProvider,
      contract: buyoutModule,
      method: 'multicall',
      args: [encodedData]
    });
  }

  public async sellFractions(vaultAddress: string, amount: string): Promise<TransactionReceipt> {
    this.#verifyIsNotReadOnly();

    if (!isAddress(vaultAddress)) throw new Error('Vault address is not valid');
    if (!isValidAmount(amount))
      throw new Error(`Fractions amount must be an integer greater than or equal to zero`);

    const buyoutModule = new Buyout({
      signerOrProvider: this.signerOrProvider,
      chainId: this.chainId
    });

    const ferc1155 = new FERC1155({
      signerOrProvider: this.signerOrProvider,
      chainId: this.chainId
    });

    // Validate that vault has a live auction
    const buyoutInfo = await buyoutModule.buyoutInfo(vaultAddress);
    if (!buyoutInfo) throw new Error(`Vault ${vaultAddress} does not exist`);
    if (buyoutInfo.state !== AuctionState.live) {
      throw new Error(`Fractions can only be sold during a live auction`);
    }

    // Validate that proposal period is still active
    const proposalPeriod = await buyoutModule.PROPOSAL_PERIOD();
    const proposalPeriodEnd = proposalPeriod.add(buyoutInfo.startTime);
    const now = Math.floor(Date.now() / 1000);
    if (now >= proposalPeriodEnd.toNumber()) {
      throw new Error(`Cannot sell fractions after the proposal period has ended`);
    }

    // Validate that user has sufficient balance
    const wallet = await getCurrentWallet(this.signerOrProvider);
    const vaultId = await getVaultId(vaultAddress, this.signerOrProvider);
    const balance = await ferc1155.balanceOf(wallet.address, vaultId);
    if (balance.isZero()) {
      throw new Error(`You don't own any tokens from this vault`);
    }

    if (balance.lt(amount)) {
      throw new Error(`Amount of fractions to sell is greater than your balance`);
    }

    // Validate that buyout module has permission to transfer tokens. If not, use permit to allow it.
    const isApprovedForAll = await ferc1155.isApprovedForAll(wallet.address, buyoutModule.address);
    if (isApprovedForAll) {
      return buyoutModule.sellFractions(vaultAddress, amount);
    }

    const ferc1155Contract = ferc1155.ferc1155;
    const buyoutContract = buyoutModule.buyout;

    const signature = await getPermitSignature(
      buyoutModule.address,
      ferc1155Contract,
      this.signerOrProvider
    );

    const selfPermitAllData = buyoutContract.interface.encodeFunctionData('selfPermitAll', [
      ferc1155.address,
      signature.approved,
      signature.deadline,
      signature.v,
      signature.r,
      signature.s
    ]);

    const sellFractionsData = buyoutContract.interface.encodeFunctionData('sellFractions', [
      vaultAddress,
      amount
    ]);

    const encodedData = [selfPermitAllData, sellFractionsData];

    return executeTransaction({
      signerOrProvider: this.signerOrProvider,
      contract: buyoutContract,
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
