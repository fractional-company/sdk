export interface ContractOverrides {
  nonce?: BigNumberish;
  gasLimit?: BigNumberish;
  gasPrice?: BigNumberish;
  value?: BigNumberish;
}

export interface Proof {
  [key: number]: string[];
}

export interface Token {
  standard: string;
  address: string;
  id?: BigNumberish;
  amount?: BigNumberish;
  data?: string[];
}
