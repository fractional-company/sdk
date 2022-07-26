export interface ContractOverrides {
  nonce?: BigNumberish;
  gasLimit?: BigNumberish;
  gasPrice?: BigNumberish;
  value?: BigNumberish;
}

export interface Token {
  standard: string;
  address: string;
  id?: BigNumberish;
  amount?: string;
  data?: string[];
}

export type Proof = string[][];

export const enum AuctionState {
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

export interface Permission {
  module: string;
  target: string;
  selector: string;
}
