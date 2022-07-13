export interface ContractOverrides {
  nonce?: BigNumberish;
  gasLimit?: BigNumberish;
  gasPrice?: BigNumberish;
  value?: BigNumberish;
}

export interface Proof {
  [key: number]: string[];
}
