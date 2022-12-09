import { TransactionResponse } from '@ethersproject/providers';
import { BigNumber, BigNumberish } from 'ethers';
import { isAddress } from 'ethers/lib/utils';
import { Contract, NullAddress, Proofs } from '../../constants';
import {
  LPDA as LPDAInterface,
  LPDA__factory as LPDAFactory,
  Multicall__factory as MulticallFactory
} from '../../contracts';
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

export interface LPDAInfo {
  startTime: number;
  endTime: number;
  dropPerSecond: string;
  startPrice: string;
  endPrice: string;
  minBid: string;
  supply: number;
  numSold: number;
  curator: string;
  curatorClaimed: string;
}

export function LPDAModule<TBase extends Constructor>(Base: TBase) {
  return class extends Base {
    #address: string;
    lpdaContract: LPDAInterface;

    constructor(...args: any[]) {
      super(...args);

      this.#address = getContractAddress(Contract.LPDA, this.chainId);
      this.lpdaContract = LPDAFactory.connect(this.#address, this.connection);
    }

    // ======== Read Methods ========

    public async getAuction(): Promise<LPDAInfo> {
      try {
        const info = await this.lpdaContract.vaultLPDAInfo(this.vaultAddress);

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
          curatorClaimed: info.curatorClaimed.toString()
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
        const currentState = await this.lpdaContract.getAuctionState(this.vaultAddress);
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
        const balance = await this.lpdaContract.balanceContributed(this.vaultAddress, address);
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
        const balance = await this.lpdaContract.balanceRefunded(this.vaultAddress, address);
        return balance.toString();
      } catch (e) {
        throw new Error(formatError(e));
      }
    }

    public async getBids() {
      try {
        const events = await this.lpdaContract.queryFilter(
          this.lpdaContract.filters.BidEntered(this.vaultAddress)
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
        const price = await this.lpdaContract.currentPrice(this.vaultAddress);
        return price.toString();
      } catch (e) {
        throw new Error(formatError(e));
      }
    }

    public async getLPDAFeeReceiver() {
      try {
        return await this.lpdaContract.feeReceiver();
      } catch (e) {
        throw new Error(formatError(e));
      }
    }

    public async getMinters(): Promise<string[]> {
      try {
        const minters = await this.lpdaContract.getMinters(this.vaultAddress);
        return [...new Set(minters)];
      } catch (e) {
        throw new Error(formatError(e));
      }
    }

    public async getNumMinted(address: string) {
      if (!isAddress(address)) {
        throw new Error('Invalid address');
      }

      try {
        const num = await this.lpdaContract.numMinted(this.vaultAddress, address);
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
        const refund = await this.lpdaContract.refundOwed(this.vaultAddress, address);
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
          contract: this.lpdaContract,
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
          contract: this.lpdaContract,
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
          contract: this.lpdaContract,
          method: 'settleAddress',
          args: [this.vaultAddress, addressToSettle]
        });
      } catch (e) {
        throw new Error(formatError(e));
      }
    }

    public async settleAllAddresses(): Promise<TransactionResponse> {
      const multicallContract = MulticallFactory.connect(
        getContractAddress(Contract.Multicall, this.chainId),
        this.connection
      );

      try {
        const addresses = await this.getMinters();
        if (addresses.length === 0) throw new Error('No addresses to settle');

        const data: {
          target: string;
          allowFailure: boolean;
          callData: string;
        }[] = [];

        for (const address of addresses) {
          const callData = this.lpdaContract.interface.encodeFunctionData('settleAddress', [
            this.vaultAddress,
            address
          ]);
          const target = this.lpdaContract.address;
          const allowFailure = true;
          data.push({ target, allowFailure, callData });
        }

        return await executeTransaction({
          connection: this.connection,
          contract: multicallContract,
          method: 'aggregate3',
          args: [data]
        });
      } catch (e) {
        throw new Error(formatError(e));
      }
    }

    public async settleCurator(): Promise<TransactionResponse> {
      try {
        return await executeTransaction({
          connection: this.connection,
          contract: this.lpdaContract,
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
          contract: this.lpdaContract,
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
      this.lpdaContract.on(
        this.lpdaContract.filters.BidEntered(this.vaultAddress),
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
      this.lpdaContract.removeAllListeners(this.lpdaContract.filters.BidEntered(this.vaultAddress));
    }

    // ======== Gas Estimation ========
    public estimateGas = {
      enterBid: async (amount: BigNumberish) => {
        try {
          const pricePerRae = await this.getCurrentPrice();
          const totalValue = BigNumber.from(pricePerRae).mul(amount);

          return await estimateTransactionGas({
            connection: this.connection,
            contract: this.lpdaContract,
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
            contract: this.lpdaContract,
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
            contract: this.lpdaContract,
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
            contract: this.lpdaContract,
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
            contract: this.lpdaContract,
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
