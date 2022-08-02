import { BigNumber } from 'ethers';

export enum AuctionState {
  inactive = 0,
  live = 1,
  success = 2
}

export interface BuyoutInfo {
  ethBalance: BigNumber;
  fractionPrice: BigNumber;
  lastTotalSupply: BigNumber;
  proposer: string;
  startTime: BigNumber;
  state: AuctionState;
}
