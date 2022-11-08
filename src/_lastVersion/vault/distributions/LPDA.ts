import { TransactionResponse } from '@ethersproject/providers';
import { BigNumber, BigNumberish } from 'ethers';
import { isAddress } from 'ethers/lib/utils';
import { NullAddress, Proofs } from '../../constants';
import { Contract } from '../../constants/contracts';
import { LPDA as LPDAInterface, LPDA__factory as LPDAFactory } from '../../contracts';
import {
  estimateTransactionGas,
  executeTransaction,
  formatError,
  getContractAddress,
  getCurrentWallet,
  isValidAmount
} from '../../utils';
import { Constructor } from '../core/Vault';

export enum LPDAState {
  NotLive = 'NOT_LIVE',
  Live = 'LIVE',
  Successful = 'SUCCESSFUL',
  NotSuccessful = 'NOT_SUCCESSFUL'
}

export enum LPDAEvents {
  CreatedLPDA = 'CreatedLPDA',
  BidEntered = 'BidEntered',
  Refunded = 'Refunded',
  MintedRaes = 'MintedRaes',
  CuratorClaimed = 'CuratorClaimed',
  FeeDispersed = 'FeeDispersed',
  CuratorRedeemedNFT = 'CuratorRedeemedNFT'
}

export function LPDAModule<TBase extends Constructor>(Base: TBase) {
  return class extends Base {
    #address: string;
    #contract: LPDAInterface;

    constructor(...args: any[]) {
      super(...args);

      this.#address = getContractAddress(Contract.LPDA, this.chainId);
      this.#contract = LPDAFactory.connect(this.#address, this.connection);
    }

    // ======== Read Methods ========

    public async getAuction() {
      try {
        const info = await this.#contract.vaultLPDAInfo(this.vaultAddress);

        if (info.curator === NullAddress) {
          throw new Error('Vault has no auction');
        }

        return {
          startTime: info.startTime,
          endTime: info.endTime,
          dropPerSecond: info.dropPerSecond.toString(),
          startPrice: info.startPrice.toString(),
          endPrice: info.endPrice.toString(),
          minBid: info.minBid.toString(),
          supply: info.supply,
          numSold: info.numSold,
          curator: info.curator,
          curatorClaimed: Boolean(info.curatorClaimed.toString())
        };
      } catch (e) {
        throw new Error(formatError(e));
      }
    }

    public async getAuctionState(): Promise<LPDAState> {
      const state: {
        [key: number]: LPDAState;
      } = {
        0: LPDAState.NotLive,
        1: LPDAState.Live,
        2: LPDAState.Successful,
        3: LPDAState.NotSuccessful
      };

      try {
        const currentState = await this.#contract.getAuctionState(this.vaultAddress);
        return state[currentState];
      } catch (e) {
        throw new Error(formatError(e));
      }
    }

    public async getBalanceContributed(address: string) {
      if (!isAddress(address)) {
        throw new Error('Invalid address');
      }

      try {
        const balance = await this.#contract.balanceContributed(this.vaultAddress, address);
        return balance.toString();
      } catch (e) {
        throw new Error(formatError(e));
      }
    }

    public async getBalanceRefunded(address: string) {
      if (!isAddress(address)) {
        throw new Error('Invalid address');
      }

      try {
        const balance = await this.#contract.balanceRefunded(this.vaultAddress, address);
        return balance.toString();
      } catch (e) {
        throw new Error(formatError(e));
      }
    }

    public async getBids() {
      try {
        const events = await this.#contract.queryFilter(
          this.#contract.filters.BidEntered(this.vaultAddress)
        );

        return events.map((event) => ({
          bidderAddress: event.args._user,
          priceWei: event.args._price.toString(),
          quantity: event.args._quantity.toNumber(),
          transactionHash: event.transactionHash,
          blockNumber: event.blockNumber
        }));
      } catch (e) {
        throw new Error(formatError(e));
      }
    }

    public async getCurrentPrice(): Promise<string> {
      try {
        const price = await this.#contract.currentPrice(this.vaultAddress);
        return price.toString();
      } catch (e) {
        throw new Error(formatError(e));
      }
    }

    public async getLPDAFeeReceiver() {
      try {
        return await this.#contract.feeReceiver();
      } catch (e) {
        throw new Error(formatError(e));
      }
    }

    public async getMinters() {
      try {
        const minters = await this.#contract.getMinters(this.#address);
        return minters;
      } catch (e) {
        throw new Error(formatError(e));
      }
    }

    public async getNumMinted(address?: string) {
      if (address && !isAddress(address)) {
        throw new Error('Invalid address');
      }

      try {
        const wallet = await getCurrentWallet(this.connection);
        const addressToLookup = address || wallet.address;
        const num = await this.#contract.numMinted(this.vaultAddress, addressToLookup);
        return num.toNumber();
      } catch (e) {
        throw new Error(formatError(e));
      }
    }

    public async getRefundOwed(address: string) {
      if (!isAddress(address)) {
        throw new Error('Invalid address');
      }

      try {
        const refund = await this.#contract.refundOwed(this.vaultAddress, address);
        return refund.toString();
      } catch (e) {
        throw new Error(formatError(e));
      }
    }

    // ======== Write Methods ========

    public async enterBid(amount: BigNumberish): Promise<TransactionResponse> {
      if (!isValidAmount(amount)) {
        throw new Error('Invalid rae amount');
      }

      try {
        const pricePerRae = await this.getCurrentPrice();
        const totalValue = BigNumber.from(pricePerRae).mul(amount);

        const { balance } = await getCurrentWallet(this.connection);
        if (balance.lt(totalValue)) {
          throw new Error('Insufficient balance');
        }

        return await executeTransaction({
          connection: this.connection,
          contract: this.#contract,
          method: 'enterBid',
          args: [this.vaultAddress, amount],
          options: { value: totalValue }
        });
      } catch (e) {
        throw new Error(formatError(e));
      }
    }

    public async redeemNTFCurator(
      tokenAddress: string,
      tokenId: BigNumberish
    ): Promise<TransactionResponse> {
      try {
        const { curator } = await this.getAuction();
        const wallet = await getCurrentWallet(this.connection);
        if (wallet.address !== curator) {
          throw new Error('Only the curator can redeem the NFT');
        }

        const { redeemProof } = Proofs[this.chainId];

        return await executeTransaction({
          connection: this.connection,
          contract: this.#contract,
          method: 'redeemNFTCurator',
          args: [this.vaultAddress, tokenAddress, tokenId, redeemProof]
        });
      } catch (e) {
        throw new Error(formatError(e));
      }
    }

    public async settleAddress(minter?: string): Promise<TransactionResponse> {
      if (minter && !isAddress(minter)) {
        throw new Error('Invalid address');
      }

      try {
        const wallet = await getCurrentWallet(this.connection);
        const addressToSettle = minter || wallet.address;

        return await executeTransaction({
          connection: this.connection,
          contract: this.#contract,
          method: 'settleAddress',
          args: [this.vaultAddress, addressToSettle]
        });
      } catch (e) {
        throw new Error(formatError(e));
      }
    }

    // todo: implement function
    // public async settleAllAddresses(): Promise<TransactionResponse> {}

    public async settleCurator(): Promise<TransactionResponse> {
      try {
        return await executeTransaction({
          connection: this.connection,
          contract: this.#contract,
          method: 'settleCurator',
          args: [this.vaultAddress]
        });
      } catch (e) {
        throw new Error(formatError(e));
      }
    }

    public async updateLPDAFeeReceiver(receiver: string): Promise<TransactionResponse> {
      if (!isAddress(receiver)) {
        throw new Error('Invalid receiver address');
      }

      try {
        return await executeTransaction({
          connection: this.connection,
          contract: this.#contract,
          method: 'updateFeeReceiver',
          args: [receiver]
        });
      } catch (e) {
        throw new Error(formatError(e));
      }
    }

    // ======== Events ========
    public subscribeToBids(
      callback: (bid: {
        bidderAddress: string;
        priceWei: string;
        quantity: number;
        transactionHash: string;
        blockNumber: number;
      }) => void
    ) {
      this.#contract.on(
        this.#contract.filters.BidEntered(this.vaultAddress),
        (vault, user, quantity, price, event) => {
          callback({
            bidderAddress: user,
            priceWei: price.toString(),
            quantity: quantity.toNumber(),
            transactionHash: event.transactionHash,
            blockNumber: event.blockNumber
          });
        }
      );
    }

    public unsubscribeFromBids() {
      this.#contract.removeAllListeners(this.#contract.filters.BidEntered(this.vaultAddress));
    }

    // ======== Gas Estimation ========
    public estimateGas = {
      enterBid: async (amount: BigNumberish) => {
        try {
          const pricePerRae = await this.getCurrentPrice();
          const totalValue = BigNumber.from(pricePerRae).mul(amount);

          return await estimateTransactionGas({
            connection: this.connection,
            contract: this.#contract,
            method: 'enterBid',
            args: [this.vaultAddress, amount],
            options: { value: totalValue }
          });
        } catch (e) {
          throw new Error(formatError(e));
        }
      },
      redeemNFTCurator: async (tokenAddress: string, tokenId: BigNumberish) => {
        try {
          const { redeemProof } = Proofs[this.chainId];

          return await estimateTransactionGas({
            connection: this.connection,
            contract: this.#contract,
            method: 'redeemNFTCurator',
            args: [this.vaultAddress, tokenAddress, tokenId, redeemProof]
          });
        } catch (e) {
          throw new Error(formatError(e));
        }
      },
      settleAddress: async (minter?: string) => {
        try {
          if (!minter) {
            const wallet = await getCurrentWallet(this.connection);
            minter = wallet.address;
          }

          return await estimateTransactionGas({
            connection: this.connection,
            contract: this.#contract,
            method: 'settleAddress',
            args: [this.vaultAddress, minter]
          });
        } catch (e) {
          throw new Error(formatError(e));
        }
      },
      settleCurator: async () => {
        try {
          return await estimateTransactionGas({
            connection: this.connection,
            contract: this.#contract,
            method: 'settleCurator',
            args: [this.vaultAddress]
          });
        } catch (e) {
          throw new Error(formatError(e));
        }
      },
      updateLPDAFeeReceiver: async (receiver: string) => {
        try {
          return await estimateTransactionGas({
            connection: this.connection,
            contract: this.#contract,
            method: 'updateFeeReceiver',
            args: [receiver]
          });
        } catch (e) {
          throw new Error(formatError(e));
        }
      }
    };
  };
}
