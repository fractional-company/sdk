import { TransactionReceipt } from '@ethersproject/providers';
import { BigNumber, BigNumberish } from 'ethers';
import { isAddress } from 'ethers/lib/utils';
import { NullAddress, Proofs } from '../../constants';
import { Contract } from '../../constants/contracts';
import {
  LPDA as LPDAInterface,
  LPDA__factory as LPDAFactory,
  VaultRegistry__factory as VaultRegistryFactory
} from '../../contracts';
import {
  executeTransaction,
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

export function LPDA<TBase extends Constructor>(Base: TBase) {
  return class extends Base {
    #address: string;
    #contract: LPDAInterface;

    constructor(...args: any[]) {
      super(...args);

      this.#address = getContractAddress(Contract.LPDA, this.chainId);
      this.#contract = LPDAFactory.connect(this.#address, this.connection);
    }

    // Write methods

    public async enterBid(amount: BigNumberish): Promise<TransactionReceipt> {
      this.verifyIsNotReadOnly();

      if (!isValidAmount(amount)) {
        throw new Error('Invalid rae amount');
      }

      const pricePerRae = await this.getCurrentPrice();
      const totalValue = BigNumber.from(pricePerRae).mul(amount);

      const { balance } = await getCurrentWallet(this.connection);
      if (balance.lt(totalValue)) {
        throw new Error('Insufficient balance');
      }

      return executeTransaction({
        connection: this.connection,
        contract: this.#contract,
        method: 'enterBid',
        args: [this.vaultAddress, amount],
        options: { value: totalValue }
      });
    }

    public async redeemNft(
      tokenAddress: string,
      tokenId: BigNumberish
    ): Promise<TransactionReceipt> {
      this.verifyIsNotReadOnly();

      const { curator } = await this.getInfo();
      const wallet = await getCurrentWallet(this.connection);
      if (wallet.address !== curator) {
        throw new Error('Only the curator can redeem the NFT');
      }

      const { redeemProof } = Proofs[this.chainId];

      return executeTransaction({
        connection: this.connection,
        contract: this.#contract,
        method: 'redeemNFTCurator',
        args: [this.vaultAddress, tokenAddress, tokenId, redeemProof]
      });
    }

    public async settleAddress(minter?: string): Promise<TransactionReceipt> {
      this.verifyIsNotReadOnly();

      if (!minter) {
        const wallet = await getCurrentWallet(this.connection);
        minter = wallet.address;
      }

      if (minter && !isAddress(minter)) {
        throw new Error('Invalid minter address');
      }

      return executeTransaction({
        connection: this.connection,
        contract: this.#contract,
        method: 'settleAddress',
        args: [this.vaultAddress, minter]
      });
    }

    public async settleCurator(): Promise<TransactionReceipt> {
      this.verifyIsNotReadOnly();

      const { curator } = await this.getInfo();
      const wallet = await getCurrentWallet(this.connection);
      if (wallet.address !== curator) {
        throw new Error('Only the curator can settle the auction');
      }

      return executeTransaction({
        connection: this.connection,
        contract: this.#contract,
        method: 'settleCurator',
        args: [this.vaultAddress]
      });
    }

    public async updateFeeReceiver(receiver: string): Promise<TransactionReceipt> {
      this.verifyIsNotReadOnly();

      if (!isAddress(receiver)) {
        throw new Error('Invalid receiver address');
      }

      return executeTransaction({
        connection: this.connection,
        contract: this.#contract,
        method: 'updateFeeReceiver',
        args: [receiver]
      });
    }

    // Read methods

    public async getAuctionState(): Promise<LPDAState> {
      const state: {
        [key: number]: LPDAState;
      } = {
        0: LPDAState.NotLive,
        1: LPDAState.Live,
        2: LPDAState.Successful,
        3: LPDAState.NotSuccessful
      };

      const currentState = await this.#contract.getAuctionState(this.vaultAddress);
      return state[currentState];
    }

    public async getBalanceContributed(address: string) {
      if (!isAddress(address)) {
        throw new Error('Invalid address');
      }

      const balance = await this.#contract.balanceContributed(this.vaultAddress, address);
      return balance.toString();
    }

    public async getBalanceRefunded(address: string) {
      if (!isAddress(address)) {
        throw new Error('Invalid address');
      }

      const balance = await this.#contract.balanceRefunded(this.vaultAddress, address);
      return balance.toString();
    }

    public async getCurrentPrice(): Promise<string> {
      const price = await this.#contract.currentPrice(this.vaultAddress);
      return price.toString();
    }

    public async getFeeReceiver() {
      return this.#contract.feeReceiver();
    }

    public async getInfo() {
      const info = await this.#contract.vaultLPDAInfo(this.vaultAddress);
      if (info.curator === NullAddress) {
        throw new Error('Vault does not exist');
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
    }

    public async getMinters() {
      // todo: implement
    }

    public async getNumMinted(address: string) {
      if (!isAddress(address)) {
        throw new Error('Invalid address');
      }

      const num = await this.#contract.numMinted(this.vaultAddress, address);
      return num.toString();
    }

    public async getRefundOwed(address: string) {
      if (!isAddress(address)) {
        throw new Error('Invalid address');
      }

      const refund = await this.#contract.refundOwed(this.vaultAddress, address);
      return refund.toString();
    }

    public async getTokenInfo() {
      const vaultRegistryAddress = getContractAddress(Contract.VaultRegistry, this.chainId);
      const vaultRegistry = VaultRegistryFactory.connect(vaultRegistryAddress, this.connection);
      const info = await vaultRegistry.vaultToToken(this.vaultAddress);

      return {
        tokenAddress: info.token,
        tokenId: info.id.toString()
      };
    }
  };
}
