import { TransactionResponse } from '@ethersproject/abstract-provider';
import { BigNumber, BigNumberish, BytesLike } from "ethers";
import { isAddress, parseEther } from 'ethers/lib/utils';
import { Contract, NullAddress, Proofs, TokenStandard } from '../../constants';
import {
  OptimisticBid as OptimisticBidInterface,
  OptimisticBid__factory as OptimisticBidFactory
} from '../../contracts';
import { FERC1155 } from '../../tokens/FERC1155';
import {
  Config,
  estimateTransactionGas,
  executeTransaction,
  formatError,
  getContractAddress,
  getCurrentWallet,
  isNonNegativeEther,
  isValidAmount,
  isValidTokenId,
  isValidTokenStandard
} from '../../utils';
import { Constructor } from '../core/Vault';
import { GasData } from '../../types/types';

export enum OptimisticBidState {
  Inactive = 'INACTIVE',
  Live = 'LIVE',
  Success = 'SUCCESS'
}

export interface OptimisticBidInfo {
  auctionId: number;
  startTime: number;
  endTime: number;
  proposer: string;
  state: OptimisticBidState;
  raePrice: string;
  ethBalance: string;
  raeBalance: string;
  totalSupply: string;
}

export function OptimisticBidModule<TBase extends Constructor>(Base: TBase) {
  return class extends Base {
    #address: string;
    optimisticBidContract: OptimisticBidInterface;

    constructor(...args: any[]) {
      super(...args);

      this.#address = getContractAddress(Contract.OptimisticBid, this.chainId);
      this.optimisticBidContract = OptimisticBidFactory.connect(this.#address, this.connection);
    }

    // ======== Read Methods ========

    public async getOptimisticBidFeeReceiver(): Promise<string> {
      try {
        return await this.optimisticBidContract.feeReceiver();
      } catch (e) {
        throw new Error(formatError(e));
      }
    }

    public async getRejectionPeriod(): Promise<number> {
      try {
        const period = await this.optimisticBidContract.REJECTION_PERIOD();
        return parseInt(period.toString()) * 1000; // convert to milliseconds
      } catch (e) {
        throw new Error(formatError(e));
      }
    }

    public async getBuyout(auctionId?: BigNumberish): Promise<OptimisticBidInfo | null> {
      if (auctionId !== undefined && !isValidTokenId(auctionId)) {
        throw new Error('Invalid auction id');
      }

      try {
        const id =
          auctionId !== undefined ? parseInt(auctionId.toString()) : await this.#getAuctionId();

        const buyout = await this.#getBuyoutInfo(id);
        return buyout.proposer !== NullAddress ? buyout : null;
      } catch (e) {
        throw new Error(formatError(e));
      }
    }

    public async getAllBuyouts(): Promise<OptimisticBidInfo[]> {
      try {
        const currentAuctionId = await this.#getAuctionId();
        const rejectionPeriod = await this.getRejectionPeriod();

        const buyouts: OptimisticBidInfo[] = [];
        for (let i = 0; i <= currentAuctionId; i++) {
          const buyout = await this.#getBuyoutInfo(i, rejectionPeriod);
          if (buyout.proposer !== NullAddress) {
            buyouts.push(buyout);
          }
        }

        return buyouts;
      } catch (e) {
        throw new Error(formatError(e));
      }
    }

    async #getAuctionId(): Promise<number> {
      const auctionId = await this.optimisticBidContract.currentAuctionId(this.vaultAddress);
      return parseInt(auctionId.toString());
    }

    async #getBuyoutInfo(
      auctionId: BigNumberish,
      rejectionPeriod?: number
    ): Promise<OptimisticBidInfo> {
      const states: {
        [key: number]: OptimisticBidState;
      } = {
        0: OptimisticBidState.Inactive,
        1: OptimisticBidState.Live,
        2: OptimisticBidState.Success
      };

      const buyoutInfo = await this.optimisticBidContract.buyoutInfo(this.vaultAddress, auctionId);

      if (!rejectionPeriod) {
        rejectionPeriod = await this.getRejectionPeriod();
      }

      const startTime = buyoutInfo.startTime.toNumber() * 1000;
      const endTime = startTime ? startTime + rejectionPeriod : 0;

      return {
        auctionId: parseInt(auctionId.toString()),
        startTime,
        endTime,
        proposer: buyoutInfo.proposer,
        state: states[buyoutInfo.state],
        raePrice: buyoutInfo.raePrice.toString(),
        ethBalance: buyoutInfo.ethBalance.toString(),
        raeBalance: buyoutInfo.raeBalance.toString(),
        totalSupply: buyoutInfo.totalSupply.toString()
      };
    }

    // ======== Write Methods ========

    public async buyRaes(amount: BigNumberish): Promise<TransactionResponse> {
      try {
        const config = await this.#buyRaes(amount);
        return await executeTransaction(config);
      } catch (e) {
        throw new Error(formatError(e));
      }
    }

    async #buyRaes(amount: BigNumberish): Promise<Config> {
      if (!isValidAmount(amount)) {
        throw new Error('Invalid rae amount');
      }

      const buyout = await this.getBuyout();
      if (!buyout || buyout.state !== OptimisticBidState.Live) {
        throw new Error('Auction is not live');
      }

      if (BigNumber.from(amount).gt(buyout.raeBalance)) {
        throw new Error('Amount is greater than rae balance');
      }

      const totalValue = BigNumber.from(buyout.raePrice).mul(amount);
      const wallet = await getCurrentWallet(this.connection);
      if (wallet.balance.lt(totalValue)) {
        throw new Error('Insufficient ETH balance');
      }

      return {
        connection: this.connection,
        contract: this.optimisticBidContract,
        method: 'buy',
        args: [this.vaultAddress, amount],
        options: { value: totalValue }
      };
    }

    public async cashProceeds(): Promise<TransactionResponse> {
      try {
        const config = await this.#cashProceeds();

        return await executeTransaction(config);
      } catch (e) {
        throw new Error(formatError(e));
      }
    }

    async #cashProceeds(): Promise<Config> {
      const buyout = await this.getBuyout();
      if (!buyout || buyout.state !== OptimisticBidState.Success) {
        throw new Error('Buyout is not successful');
      }

      const { tokenId } = await this.getTokenInfo();
      const wallet = await getCurrentWallet(this.connection);

      const ferc1155 = new FERC1155(this.connection, this.chainId);
      const raeBalance = await ferc1155.balanceOf(wallet.address, tokenId);
      if (BigNumber.from(raeBalance).isZero()) {
        throw new Error('No rae balance');
      }

      const { burnProof } = Proofs[this.chainId];

      return {
        connection: this.connection,
        contract: this.optimisticBidContract,
        method: 'cash',
        args: [this.vaultAddress, burnProof]
      };
    }

    public async endBuyout(): Promise<TransactionResponse> {
      try {
        const config = await this.#endBuyout();
        return await executeTransaction(config);
      } catch (e) {
        throw new Error(formatError(e));
      }
    }

    async #endBuyout(): Promise<Config> {
      const buyout = await this.getBuyout();
      if (!buyout || buyout.state !== OptimisticBidState.Live) {
        throw new Error('Auction is not live');
      }

      if (buyout.endTime >= Date.now()) {
        throw new Error('Auction is not over');
      }

      const { burnProof } = Proofs[this.chainId];

      return {
        connection: this.connection,
        contract: this.optimisticBidContract,
        method: 'end',
        args: [this.vaultAddress, burnProof]
      };
    }

    public async redeemNFT(): Promise<TransactionResponse> {
      try {
        const config = await this.#redeemNFT();
        return await executeTransaction(config);
      } catch (e) {
        throw new Error(formatError(e));
      }
    }

    async #redeemNFT(): Promise<Config> {
      const buyout = await this.getBuyout();
      if (buyout && buyout.state !== OptimisticBidState.Inactive) {
        throw new Error('Auction must be inactive to redeem');
      }

      const { tokenId } = await this.getTokenInfo();
      const wallet = await getCurrentWallet(this.connection);

      const ferc1155 = new FERC1155(this.connection, this.chainId);
      const raeBalance = await ferc1155.balanceOf(wallet.address, tokenId);
      const totalSupply = await ferc1155.totalSupply(tokenId);
      if (!BigNumber.from(raeBalance).eq(totalSupply)) {
        throw new Error('Redeemer must own all the rae supply');
      }

      const { burnProof } = Proofs[this.chainId];

      return {
        connection: this.connection,
        contract: this.optimisticBidContract,
        method: 'redeem',
        args: [this.vaultAddress, burnProof]
      };
    }

    public async redeemNFTAndWithdrawTokens(
      tokens: {
        standard: TokenStandard;
        address: string;
        id?: BigNumberish;
        amount?: BigNumberish;
        receiver?: string;
      }[]
    ): Promise<TransactionResponse> {
      try {
        const { args } = await this.#redeemNFT();
        const redeemEncoded = this.optimisticBidContract.interface.encodeFunctionData(
          'redeem',
          args as [string, BytesLike[]]
        );
        const configWithdrawTokens = await this.#withdrawTokens(tokens);
        configWithdrawTokens.args?.unshift(redeemEncoded);
        return await executeTransaction(configWithdrawTokens);
      } catch (e) {
        throw new Error(formatError(e));
      }
    }

    public async startBuyout(
      amount: BigNumberish,
      value: BigNumberish
    ): Promise<TransactionResponse> {
      try {
        const config = await this.#startBuyout(amount, value);
        return await executeTransaction(config);
      } catch (e) {
        throw new Error(formatError(e));
      }
    }

    async #startBuyout(amount: BigNumberish, value: BigNumberish): Promise<Config> {
      if (!isValidAmount(amount)) {
        throw new Error('Invalid rae amount');
      }

      if (!isNonNegativeEther(value)) {
        throw new Error('Invalid ETH value');
      }

      const weiValue = parseEther(value.toString());
      const wallet = await getCurrentWallet(this.connection);
      if (wallet.balance.lt(weiValue)) {
        throw new Error('Insufficient ETH balance');
      }

      const { tokenId } = await this.getTokenInfo();
      const ferc1155 = new FERC1155(this.connection, this.chainId);
      const isApproved = await ferc1155.isApproved(wallet.address, this.#address, tokenId);
      if (!isApproved) {
        throw new Error('Must approve Optimistic Bid contract to transfer raes');
      }

      const raeBalance = await ferc1155.balanceOf(wallet.address, tokenId);
      if (BigNumber.from(raeBalance).lt(1)) {
        throw new Error('Must own at least one rae to start a buyout');
      }

      return {
        connection: this.connection,
        contract: this.optimisticBidContract,
        method: 'start',
        args: [this.vaultAddress, amount],
        options: { value: weiValue }
      };
    }

    public async updateOptimisticBidFeeReceiver(feeReceiver: string): Promise<TransactionResponse> {
      try {
        const config = this.#updateOptimisticBidFeeReceiver(feeReceiver);
        return await executeTransaction(config);
      } catch (e) {
        throw new Error(formatError(e));
      }
    }

    #updateOptimisticBidFeeReceiver(feeReceiver: string): Config {
      if (!isAddress(feeReceiver)) {
        throw new Error('Invalid fee receiver address');
      }
      return {
        connection: this.connection,
        contract: this.optimisticBidContract,
        method: 'updateFeeReceiver',
        args: [feeReceiver]
      };
    }

    public async withdrawBalance(auctionId?: string): Promise<TransactionResponse> {
      try {
        const config = await this.#withdrawBalance(auctionId);
        return await executeTransaction(config);
      } catch (e) {
        throw new Error(formatError(e));
      }
    }

    async #withdrawBalance(auctionId?: string): Promise<Config> {
      const buyout = await this.getBuyout(auctionId);
      if (!buyout || buyout.state !== OptimisticBidState.Inactive) {
        throw new Error('Auction must be inactive to withdraw balance');
      }

      const wallet = await getCurrentWallet(this.connection);
      if (buyout.proposer !== wallet.address) {
        throw new Error('Only auction proposer can withdraw balance');
      }

      return {
        connection: this.connection,
        contract: this.optimisticBidContract,
        method: 'withdraw',
        args: [this.vaultAddress, buyout.auctionId]
      };
    }

    public async withdrawTokens(
      tokens: {
        standard: TokenStandard;
        address: string;
        id?: BigNumberish;
        amount?: BigNumberish;
        receiver?: string;
      }[]
    ): Promise<TransactionResponse> {
      try {
        const config = await this.#withdrawTokens(tokens);
        return await executeTransaction(config);
      } catch (e) {
        throw new Error(formatError(e));
      }
    }

    async #withdrawTokens(
      tokens: {
        standard: TokenStandard;
        address: string;
        id?: BigNumberish;
        amount?: BigNumberish;
        receiver?: string;
      }[]
    ): Promise<Config> {
      if (!Array.isArray(tokens)) {
        throw new Error('Tokens must be an array');
      }

      if (tokens.length === 0) {
        throw new Error('Tokens array must not be empty');
      }

      const buyout = await this.getBuyout();
      if (!buyout || buyout.state !== OptimisticBidState.Success) {
        throw new Error('Auction must be successful to withdraw NFTs');
      }

      const wallet = await getCurrentWallet(this.connection);
      if (buyout.proposer !== wallet.address) {
        throw new Error('Only auction proposer can withdraw NFTs');
      }

      const { withdrawERC20Proof, withdrawERC721Proof, batchWithdrawERC1155Proof } =
        Proofs[this.chainId];

      // Each key is "tokenAddress_tokenReceiver"
      const erc1155Tokens: {
        [key: string]: {
          receiver: string;
          address: string;
          ids: BigNumberish[];
          amounts: BigNumberish[];
        };
      } = {};

      const encodedData: string[] = [];

      for (const token of tokens) {
        if (!isValidTokenStandard(token.standard)) {
          throw new Error(`Invalid token standard ${token.standard}`);
        }

        if (!isAddress(token.address)) {
          throw new Error(`Invalid token address ${token.address}`);
        }

        if (token.receiver && !isAddress(token.receiver)) {
          throw new Error(`Invalid receiver address ${token.receiver}`);
        }

        const tokenReceiver = token.receiver || wallet.address;
        const tokenStandard = token.standard.toUpperCase();
        const erc1155Key = `${token.address}_${tokenReceiver}`;

        switch (tokenStandard) {
          case TokenStandard.ERC20:
            if (!token.amount || !isValidAmount(token.amount)) {
              throw new Error(`ERC20 token ${token.address} amount is invalid`);
            }

            encodedData.push(
              this.optimisticBidContract.interface.encodeFunctionData('withdrawERC20', [
                this.vaultAddress,
                token.address,
                tokenReceiver,
                token.amount,
                withdrawERC20Proof
              ])
            );

            break;
          case TokenStandard.ERC721:
            if (!token.id || !isValidTokenId(token.id)) {
              throw new Error(`ERC721 token ${token.address} id is invalid`);
            }

            encodedData.push(
              this.optimisticBidContract.interface.encodeFunctionData('withdrawERC721', [
                this.vaultAddress,
                token.address,
                tokenReceiver,
                token.id,
                withdrawERC721Proof
              ])
            );

            break;
          case TokenStandard.ERC1155:
            if (!token.id || !isValidTokenId(token.id)) {
              throw new Error(`ERC1155 token ${token.address} id is invalid`);
            }

            if (!token.amount || !isValidAmount(token.amount)) {
              throw new Error(`ERC1155 token ${token.address} amount is invalid`);
            }

            if (erc1155Tokens[erc1155Key]) {
              erc1155Tokens[erc1155Key].ids.push(token.id);
              erc1155Tokens[erc1155Key].amounts.push(token.amount);
            } else {
              erc1155Tokens[erc1155Key] = {
                receiver: tokenReceiver,
                address: token.address,
                ids: [token.id],
                amounts: [token.amount]
              };
            }

            break;
          default:
            throw new Error(`Token standard ${token.standard} not supported`);
        }
      }

      // Create encoded data for ERC1155 transactions
      for (const erc1155Token of Object.values(erc1155Tokens)) {
        encodedData.push(
          this.optimisticBidContract.interface.encodeFunctionData('batchWithdrawERC1155', [
            this.vaultAddress,
            erc1155Token.address,
            erc1155Token.receiver,
            erc1155Token.ids,
            erc1155Token.amounts,
            batchWithdrawERC1155Proof
          ])
        );
      }

      return {
        connection: this.connection,
        contract: this.optimisticBidContract,
        method: 'multicall',
        args: [encodedData]
      };
    }

    // ======== Gas Estimation ========
    public estimateGasOptimistic = {
      buyRaes: async (amount: BigNumberish): Promise<GasData> => {
        try {
          const options = await this.#buyRaes(amount);
          return await estimateTransactionGas(options);
        } catch (e) {
          throw new Error(formatError(e));
        }
      }
    };
  };
}
