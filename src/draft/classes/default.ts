import Base from './base';
import { Connection, Options } from '../types/types';
import { Contract, BigNumberish, BigNumber } from 'ethers';
import { TransactionReceipt } from '@ethersproject/providers';
import { isAddress, parseEther, formatEther } from 'ethers/lib/utils';
import { Token, AuctionState } from '../types/types';
import {
  BuyoutInfo,
  ModulesContracts,
  TargetContracts,
  Contracts,
  TokenStandards
} from '../constants';
import {
  isNonNegativeEther,
  isValidAmount,
  isValidTokenStandard,
  isValidTokenId,
  executeTransaction,
  getCurrentWallet,
  getPermitSignature,
  getProofsByAddress,
  getProofsByModules,
  getVaultId
} from '../utils';

export default class Default extends Base {
  constructor(connection: Connection, options: Options) {
    super(connection, options);
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
    vaultId: string;
    transactionHash: string;
  }> {
    this.verifyIsNotReadOnly();

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
      const moduleContract = ModulesContracts[moduleName.toUpperCase()]?.[this.variant];
      if (!moduleContract) throw new Error(`Module ${moduleName} does not exist `);
      const moduleAddress = moduleContract.address[this.chainId];
      moduleAddresses.push(moduleAddress);
      moduleNames.push(moduleName);
    }

    // Mint Proof
    const proofs = getProofsByModules(moduleNames, this.variant, this.chainId);
    const mintProof = proofs[0] || [];

    // Targets
    if (!Array.isArray(targets)) throw new Error(`Targets must be an array`);
    const targetAddresses: string[] = [];
    for (const targetName of targets) {
      if (typeof targetName !== 'string') throw new Error(`Target name must be a string`);
      const targetContract = TargetContracts[targetName.toUpperCase()]?.[this.variant];
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

    const baseVault = Contracts.BaseVault[this.variant];
    const baseVaultAddress = baseVault.address[this.chainId];
    const baseVaultContract = new Contract(baseVaultAddress, baseVault.ABI, this.connection);

    const tx = await executeTransaction({
      contract: baseVaultContract,
      method: 'deployVault',
      args: [fractionSupply, moduleAddresses, targetAddresses, selectors, mintProof],
      connection: this.connection
    });

    const vaultAddress = tx.logs[0].address;
    const vaultId = await getVaultId(vaultAddress, this.variant, this.connection);

    return {
      vaultAddress,
      vaultId: vaultId,
      transactionHash: tx.transactionHash
    };
  }

  public async depositTokens(
    from: string,
    to: string,
    tokens: Token[]
  ): Promise<TransactionReceipt> {
    this.verifyIsNotReadOnly();

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

    const baseVaultABI = Contracts.BaseVault[this.variant].ABI;
    const baseVaultAddress = Contracts.BaseVault[this.variant].address[this.chainId];
    const baseVault = new Contract(baseVaultAddress, baseVaultABI, this.connection);

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
      connection: this.connection,
      contract: baseVault,
      method: 'multicall',
      args: [encodedData]
    });
  }

  public async getTokenBalance(walletAddress: string, vaultAddressOrId: string): Promise<string> {
    if (!isAddress(walletAddress)) throw new Error(`Invalid wallet address ${walletAddress}`);

    const isVaultId = isValidTokenId(vaultAddressOrId);
    const isVaultAddress = isAddress(vaultAddressOrId);
    if (!isVaultId && !isVaultAddress)
      throw new Error(`Invalid vault address or id ${vaultAddressOrId}`);

    // FERC1155 Contract
    const ferc1155ABI = Contracts.FERC1155[this.variant].ABI;
    const ferc1155Address = Contracts.FERC1155[this.variant].address[this.chainId];
    const ferc1155 = new Contract(ferc1155Address, ferc1155ABI, this.connection);

    let vaultId = '';
    if (isVaultAddress) {
      vaultId = await getVaultId(vaultAddressOrId, this.variant, this.connection);
    } else {
      vaultId = vaultAddressOrId;
    }

    const [balance]: [BigNumber] = await ferc1155.functions.balanceOf(walletAddress, vaultId);
    return balance.toString();
  }

  public async getVaultInfo(vaultAddress: string): Promise<VaultInfo> {
    if (!isAddress(vaultAddress)) throw new Error('Vault address is not valid');

    // FERC1155 Contract
    const ferc1155ABI = Contracts.FERC1155[this.variant].ABI;
    const ferc1155Address = Contracts.FERC1155[this.variant].address[this.chainId];
    const ferc1155 = new Contract(ferc1155Address, ferc1155ABI, this.connection);

    let uri: string | null;
    try {
      const uriResponse: [string] = await ferc1155.functions.uri(48);
      uri = uriResponse[0];
    } catch (e) {
      uri = null;
    }

    const vaultId = await getVaultId(vaultAddress, this.variant, this.connection);
    const [totalSupply]: [BigNumber] = await ferc1155.functions.totalSupply(vaultId);
    const auctionInfo = await this.getAuctionInfo(vaultAddress);

    return {
      id: vaultId,
      address: vaultAddress,
      totalSupply: totalSupply.toString(),
      uri,
      auctionInfo
    };
  }

  public async getAuctionInfo(vaultAddress: string): Promise<AuctionInfo> {
    if (!isAddress(vaultAddress)) throw new Error('Vault address is not valid');

    const NULL_ADDRESS = '0x0000000000000000000000000000000000000000';

    // Buyout Module Contract
    const buyoutModuleABI = Contracts.Buyout[this.variant].ABI;
    const buyoutModuleAddress = Contracts.Buyout[this.variant].address[this.chainId];
    const buyoutModule = new Contract(buyoutModuleAddress, buyoutModuleABI, this.connection);

    const data: [BuyoutInfo, [BigNumber], [BigNumber]] = await Promise.all([
      buyoutModule.functions.buyoutInfo(vaultAddress),
      buyoutModule.functions.PROPOSAL_PERIOD(),
      buyoutModule.functions.REJECTION_PERIOD()
    ]);

    const buyoutInfo: BuyoutInfo = data[0];
    const proposalPeriodSeconds = data[1][0];
    const rejectionPeriodSeconds = data[2][0];

    // Modify data to make it easier to work with in javascript
    const proposalPeriodDays = proposalPeriodSeconds.toNumber() / (60 * 60 * 24); // days
    const rejectionPeriodDays = rejectionPeriodSeconds.toNumber() / (60 * 60 * 24); // days

    const startTime = buyoutInfo.startTime ? buyoutInfo.startTime.toNumber() * 1000 : 0;
    const endTime = startTime ? startTime + rejectionPeriodSeconds.toNumber() * 1000 : 0;

    const proposalPeriodEnd = startTime ? startTime + proposalPeriodSeconds.toNumber() * 1000 : 0;
    const rejectionPeriodEnd = startTime ? startTime + rejectionPeriodSeconds.toNumber() * 1000 : 0;

    const hasFractionsSold = !buyoutInfo.fractionPrice.isZero();

    const supplyOutsidePool = hasFractionsSold
      ? buyoutInfo.ethBalance.div(buyoutInfo.fractionPrice)
      : BigNumber.from(0);

    const supplyInPool = hasFractionsSold
      ? buyoutInfo.lastTotalSupply.sub(supplyOutsidePool)
      : BigNumber.from(0);

    const supplyPercentageInPool = hasFractionsSold
      ? (supplyInPool.mul(10000).div(buyoutInfo.lastTotalSupply).toNumber() / 100).toFixed(2)
      : '0.00';

    const supplyPercentageOutsidePool = hasFractionsSold
      ? (supplyOutsidePool.mul(10000).div(buyoutInfo.lastTotalSupply).toNumber() / 100).toFixed(2)
      : '0.00';

    return {
      proposalPeriodDays, // days
      rejectionPeriodDays, // days
      proposalPeriodEnd, // timestamp
      rejectionPeriodEnd, // timestamp
      ethBalance: formatEther(buyoutInfo.ethBalance), // ETH
      fractionPrice: formatEther(buyoutInfo.fractionPrice), // ETH
      supply: buyoutInfo.lastTotalSupply.toString(), // fractions
      supplyInPool: supplyInPool.toString(), // fractions
      supplyOutsidePool: supplyOutsidePool.toString(), // fractions
      supplyPercentageInPool, // percentage
      supplyPercentageOutsidePool, // percentage
      proposer: buyoutInfo.proposer === NULL_ADDRESS ? null : buyoutInfo.proposer, // address
      startTime: startTime, // timestamp (ms)
      endTime: endTime, // timestamp (ms)
      state: AuctionState[buyoutInfo.state] // string
    };
  }

  public async cashProceeds(vaultAddress: string): Promise<TransactionReceipt> {
    if (!isAddress(vaultAddress)) throw new Error('Vault address is not valid');

    // Buyout Module Contract
    const buyoutModuleABI = Contracts.Buyout[this.variant].ABI;
    const buyoutModuleAddress = Contracts.Buyout[this.variant].address[this.chainId];
    const buyoutModule = new Contract(buyoutModuleAddress, buyoutModuleABI, this.connection);

    // FERC1155 Contract
    const ferc1155ABI = Contracts.FERC1155[this.variant].ABI;
    const ferc1155Address = Contracts.FERC1155[this.variant].address[this.chainId];
    const ferc1155 = new Contract(ferc1155Address, ferc1155ABI, this.connection);

    // Auction state must be 'successful'
    const buyoutInfo: { state: number } = await buyoutModule.functions.buyoutInfo(vaultAddress);
    if (buyoutInfo.state !== AuctionState.success) {
      throw new Error('Auction must be successful in order to cash proceeds');
    }

    // Caller must have token balance > 0
    const wallet = await getCurrentWallet(this.connection);
    const vaultId = await getVaultId(vaultAddress, this.variant, this.connection);
    const [balance]: [BigNumber] = await ferc1155.functions.balanceOf(wallet.address, vaultId);

    if (balance.isZero()) {
      throw new Error('No balance in vault');
    }

    // Get burn proof
    const proofs = await getProofsByAddress(vaultAddress, this.variant, this.connection);
    const burnProof = proofs[1];

    return executeTransaction({
      contract: buyoutModule,
      method: 'cash',
      args: [vaultAddress, burnProof],
      connection: this.connection
    });
  }

  public async redeem(vaultAddress: string): Promise<TransactionReceipt> {
    this.verifyIsNotReadOnly();
    if (!isAddress(vaultAddress)) throw new Error(`Invalid vault address ${vaultAddress}`);

    // FERC1155 Contract
    const ferc1155ABI = Contracts.FERC1155[this.variant].ABI;
    const ferc1155Address = Contracts.FERC1155[this.variant].address[this.chainId];
    const ferc1155 = new Contract(ferc1155Address, ferc1155ABI, this.connection);

    // Buyout Module Contract
    const buyoutModuleABI = Contracts.Buyout[this.variant].ABI;
    const buyoutModuleAddress = Contracts.Buyout[this.variant].address[this.chainId];
    const buyoutModule = new Contract(buyoutModuleAddress, buyoutModuleABI, this.connection);

    // Validate buyout state
    const buyoutInfo: BuyoutInfo = await buyoutModule.functions.buyoutInfo(vaultAddress);
    if (!buyoutInfo) throw new Error(`Vault ${vaultAddress} does not exist`);
    if (buyoutInfo.state === AuctionState.live)
      throw new Error(`Cannot redeem tokens during a an active buyout`);
    if (buyoutInfo.state === AuctionState.success)
      throw new Error(`Cannot redeem tokens from a closed vault`);

    // Validate token supply
    const wallet = await getCurrentWallet(this.connection);
    const vaultId = await getVaultId(vaultAddress, this.variant, this.connection);
    const [balance]: [BigNumber] = await ferc1155.functions.balanceOf(wallet.address, vaultId);
    const [totalSupply]: [BigNumber] = await ferc1155.functions.totalSupply(vaultId);

    if (balance.lt(totalSupply)) {
      throw new Error(`You must own 100% of the token supply in order to redeem`);
    }

    // Get proofs
    const proofs = await getProofsByAddress(vaultAddress, this.variant, this.connection);
    const burnProof = proofs[1];

    // Check if is approved. Create permit if not.
    const [isApprovedForAll]: [boolean] = await ferc1155.functions.isApprovedForAll(
      wallet.address,
      buyoutModule.address
    );

    if (isApprovedForAll) {
      return executeTransaction({
        connection: this.connection,
        contract: buyoutModule,
        method: 'redeem',
        args: [vaultAddress, burnProof]
      });
    }

    // Get signature
    const signature = await getPermitSignature(buyoutModuleAddress, ferc1155, this.connection);

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
      connection: this.connection,
      contract: buyoutModule,
      method: 'multicall',
      args: [encodedData]
    });
  }

  public async startAuction(vaultAddress: string, amount: string): Promise<TransactionReceipt> {
    this.verifyIsNotReadOnly();

    if (!isAddress(vaultAddress)) throw new Error(`Vault address ${vaultAddress} is not valid`);
    if (!isNonNegativeEther(amount))
      throw new Error(`Amount must be greater than or equal to zero`);

    // FERC1155 Contract
    const ferc1155ABI = Contracts.FERC1155[this.variant].ABI;
    const ferc1155Address = Contracts.FERC1155[this.variant].address[this.chainId];
    const ferc1155 = new Contract(ferc1155Address, ferc1155ABI, this.connection);

    // Buyout Module Contract
    const buyoutModuleABI = Contracts.Buyout[this.variant].ABI;
    const buyoutModuleAddress = Contracts.Buyout[this.variant].address[this.chainId];
    const buyoutModule = new Contract(buyoutModuleAddress, buyoutModuleABI, this.connection);

    // Validate that vault is not already live or closed
    const buyoutInfo: BuyoutInfo = await buyoutModule.functions.buyoutInfo(vaultAddress);
    if (!buyoutInfo) throw new Error(`Vault ${vaultAddress} does not exist`);
    if (buyoutInfo.state === AuctionState.live)
      throw new Error(`Cannot start a buyout auction when there is one in progress`);
    if (buyoutInfo.state === AuctionState.success)
      throw new Error(`Cannot start a buyout auction on a closed vault`);

    // Validate that user has sufficient balance
    const wallet = await getCurrentWallet(this.connection);
    const weiAmount = parseEther(amount);
    if (wallet.balance.lte(weiAmount)) {
      throw new Error(
        `Insufficient funds. Auction bid is ${amount} ETH. Your balance is ${wallet.balance.toString()} ETH.`
      );
    }

    // Validate that user has more than zero tokens and less than the total supply
    const vaultId = await getVaultId(vaultAddress, this.variant, this.connection);
    const [balance]: [BigNumber] = await ferc1155.functions.balanceOf(wallet.address, vaultId);
    const [totalSupply]: [BigNumber] = await ferc1155.functions.totalSupply(vaultId);

    if (balance.isZero()) {
      throw new Error(`You don't own any tokens from this vault`);
    }

    if (balance.eq(totalSupply)) {
      throw new Error(`Cannot start a buyout auction if you own all the tokens`);
    }

    // Check approval status. If not approved, approve the token.
    const [isApprovedForAll]: [boolean] = await ferc1155.functions.isApprovedForAll(
      wallet.address,
      buyoutModule.address
    );
    if (!isApprovedForAll) {
      throw new Error(`You must approve the buyout contract in order to start an auction`);
    }

    return executeTransaction({
      connection: this.connection,
      contract: buyoutModule,
      method: 'start',
      args: [vaultAddress],
      options: {
        value: weiAmount
      }
    });
  }

  public async endAuction(vaultAddress: string): Promise<TransactionReceipt> {
    this.verifyIsNotReadOnly();
    if (!isAddress(vaultAddress)) throw new Error(`Vault address ${vaultAddress} is not valid`);

    // FERC1155 Contract
    const ferc1155ABI = Contracts.FERC1155[this.variant].ABI;
    const ferc1155Address = Contracts.FERC1155[this.variant].address[this.chainId];
    const ferc1155 = new Contract(ferc1155Address, ferc1155ABI, this.connection);

    // Buyout Module Contract
    const buyoutModuleABI = Contracts.Buyout[this.variant].ABI;
    const buyoutModuleAddress = Contracts.Buyout[this.variant].address[this.chainId];
    const buyoutModule = new Contract(buyoutModuleAddress, buyoutModuleABI, this.connection);

    // Validate buyout state
    const buyoutInfo: BuyoutInfo = await buyoutModule.functions.buyoutInfo(vaultAddress);
    if (!buyoutInfo) throw new Error(`Vault ${vaultAddress} does not exist`);
    if (buyoutInfo.state === AuctionState.inactive) throw new Error(`Buyout auction is not active`);
    if (buyoutInfo.state === AuctionState.success)
      throw new Error(`Buyout auction is already closed`);

    // Validate that rejection has ended
    const [rejectionPeriod]: [BigNumber] = await buyoutModule.functions.REJECTION_PERIOD();
    const auctionEnd = rejectionPeriod.toNumber() + buyoutInfo.startTime.toNumber(); // unix timestamp in seconds
    const now = Math.floor(Date.now() / 1000);
    if (now < auctionEnd) {
      throw new Error(`Cannot end auction before the rejection period has ended`);
    }

    // Get proofs
    const proofs = await getProofsByAddress(vaultAddress, this.variant, this.connection);
    const burnProof = proofs[1];

    // Check approval status. If not approved, use multicall with permit.
    const wallet = await getCurrentWallet(this.connection);
    const [isApprovedForAll]: [boolean] = await ferc1155.functions.isApprovedForAll(
      wallet.address,
      buyoutModule.address
    );

    if (isApprovedForAll) {
      return executeTransaction({
        connection: this.connection,
        contract: buyoutModule,
        method: 'end',
        args: [vaultAddress, burnProof]
      });
    }

    const signature = await getPermitSignature(buyoutModuleAddress, ferc1155, this.connection);

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
      connection: this.connection,
      contract: buyoutModule,
      method: 'multicall',
      args: [encodedData]
    });
  }

  public async sellFractions(vaultAddress: string, amount: string): Promise<TransactionReceipt> {
    this.verifyIsNotReadOnly();

    if (!isAddress(vaultAddress)) throw new Error('Vault address is not valid');
    if (!isValidAmount(amount))
      throw new Error(`Fractions amount must be an integer greater than or equal to zero`);

    // Buyout Module Contract
    const buyoutModuleABI = Contracts.Buyout[this.variant].ABI;
    const buyoutModuleAddress = Contracts.Buyout[this.variant].address[this.chainId];
    const buyoutModule = new Contract(buyoutModuleAddress, buyoutModuleABI, this.connection);

    // FERC1155 Contract
    const ferc1155ABI = Contracts.FERC1155[this.variant].ABI;
    const ferc1155Address = Contracts.FERC1155[this.variant].address[this.chainId];
    const ferc1155 = new Contract(ferc1155Address, ferc1155ABI, this.connection);

    // Validate that vault has a live auction
    const buyoutInfo: BuyoutInfo = await buyoutModule.functions.buyoutInfo(vaultAddress);
    if (!buyoutInfo) throw new Error(`Vault ${vaultAddress} does not exist`);
    if (buyoutInfo.state !== AuctionState.live) {
      throw new Error(`Fractions can only be sold during a live auction`);
    }

    // Validate that proposal period is still active
    const [proposalPeriod]: [BigNumber] = await buyoutModule.functions.PROPOSAL_PERIOD();
    const proposalPeriodEnd = proposalPeriod.add(buyoutInfo.startTime);
    const now = Math.floor(Date.now() / 1000);
    if (now >= proposalPeriodEnd.toNumber()) {
      throw new Error(`Cannot sell fractions after the proposal period has ended`);
    }

    // Validate that user has sufficient balance
    const wallet = await getCurrentWallet(this.connection);
    const vaultId = await getVaultId(vaultAddress, this.variant, this.connection);
    const [balance]: [BigNumber] = await ferc1155.functions.balanceOf(wallet.address, vaultId);
    if (balance.isZero()) {
      throw new Error(`You don't own any tokens from this vault`);
    }

    if (balance.lt(amount)) {
      throw new Error(`Amount of fractions to sell is greater than your balance`);
    }

    // Validate that buyout module has permission to transfer tokens. If not, use permit to allow it.
    const [isApprovedForAll]: [boolean] = await ferc1155.functions.isApprovedForAll(
      wallet.address,
      buyoutModule.address
    );
    if (isApprovedForAll) {
      return executeTransaction({
        connection: this.connection,
        contract: buyoutModule,
        method: 'sellFractions',
        args: [vaultAddress, amount]
      });
    }

    const signature = await getPermitSignature(buyoutModule.address, ferc1155, this.connection);

    const selfPermitAllData = buyoutModule.interface.encodeFunctionData('selfPermitAll', [
      ferc1155.address,
      signature.approved,
      signature.deadline,
      signature.v,
      signature.r,
      signature.s
    ]);

    const sellFractionsData = buyoutModule.interface.encodeFunctionData('sellFractions', [
      vaultAddress,
      amount
    ]);

    const encodedData = [selfPermitAllData, sellFractionsData];

    return executeTransaction({
      connection: this.connection,
      contract: buyoutModule,
      method: 'multicall',
      args: [encodedData]
    });
  }

  public async buyFractions(vaultAddress: string, amount: string): Promise<TransactionReceipt> {
    this.verifyIsNotReadOnly();

    if (!isAddress(vaultAddress)) throw new Error('Vault address is not valid');
    if (!isValidAmount(amount))
      throw new Error(`Fractions amount must be an integer greater than or equal to zero`);

    // Buyout Module Contract
    const buyoutModuleABI = Contracts.Buyout[this.variant].ABI;
    const buyoutModuleAddress = Contracts.Buyout[this.variant].address[this.chainId];
    const buyoutModule = new Contract(buyoutModuleAddress, buyoutModuleABI, this.connection);

    // Validate that vault has a live auction
    const buyoutInfo: BuyoutInfo = await buyoutModule.functions.buyoutInfo(vaultAddress);
    if (!buyoutInfo) throw new Error(`Vault ${vaultAddress} does not exist`);
    if (buyoutInfo.state !== AuctionState.live) {
      throw new Error(`Fractions can only be bought during a live auction`);
    }

    // Validate that proposal period is still active
    const [rejectionPeriod]: [BigNumber] = await buyoutModule.functions.REJECTION_PERIOD();
    const rejectionPeriodEnd = rejectionPeriod.add(buyoutInfo.startTime);
    const now = Math.floor(Date.now() / 1000);
    if (now >= rejectionPeriodEnd.toNumber()) {
      throw new Error(`Cannot buy fractions after the rejection period has ended`);
    }

    // Validate that user has sufficient eth balance
    const wallet = await getCurrentWallet(this.connection);
    const totalValue = BigNumber.from(amount).mul(buyoutInfo.fractionPrice);
    if (wallet.balance.lt(totalValue)) {
      throw new Error(`Insufficient balance`);
    }

    const hasFractionsSold = !buyoutInfo.fractionPrice.isZero();
    const supplyOutsidePool = hasFractionsSold
      ? buyoutInfo.ethBalance.div(buyoutInfo.fractionPrice)
      : BigNumber.from(0);
    const supplyInPool = hasFractionsSold
      ? buyoutInfo.lastTotalSupply.sub(supplyOutsidePool)
      : BigNumber.from(0);

    if (supplyInPool.lt(amount)) {
      throw new Error(`Amount of fractions is greater than supply in pool`);
    }

    return executeTransaction({
      connection: this.connection,
      contract: buyoutModule,
      method: 'buyFractions',
      args: [vaultAddress, amount],
      options: {
        value: totalValue.toString()
      }
    });
  }
}

interface AuctionInfo {
  proposalPeriodDays: number;
  rejectionPeriodDays: number;
  proposalPeriodEnd: number;
  rejectionPeriodEnd: number;
  ethBalance: string;
  fractionPrice: string;
  supply: string;
  supplyInPool: string;
  supplyOutsidePool: string;
  supplyPercentageInPool: string;
  supplyPercentageOutsidePool: string;
  proposer: string | null;
  startTime: number;
  endTime: number;
  state: string;
}

interface VaultInfo {
  address: string;
  id: string;
  totalSupply: string;
  uri: string | null;
  auctionInfo: AuctionInfo;
}
