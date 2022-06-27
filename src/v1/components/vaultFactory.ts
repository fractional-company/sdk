/* eslint-disable */
import { Signer, Contract } from 'ethers';
import { isAddress } from '@ethersproject/address';
import { isValidFractionSchema } from '../utilities';
import nftAbi from '../abis/nft.json';

export class VaultFactory {
  public fractionSchema: string;
  public address: string;
  private signer: Signer;
  private vaultFactory: Contract;

  constructor(fractionSchema: string, signer: Signer) {
    if (!isValidFractionSchema(fractionSchema)) throw new Error('Fraction schema is not valid');
    if (!Signer.isSigner(signer)) throw new Error('Signer is not a valid');

    // todo: get latest abi and address based on the fraction schema
    const abi = '';
    const address = '';

    this.vaultFactory = new Contract(address, abi, signer);
    this.fractionSchema = fractionSchema.toUpperCase();
    this.signer = signer;
    this.address = address;
  }

  public async setApproval(nftContractAddress: string): Promise<void> {
    if (!isAddress(nftContractAddress)) throw new Error('NFT contract address is not valid');

    const nftContract = new Contract(nftContractAddress, nftAbi, this.signer);
    await nftContract.setApprovalForAll(this.address, true);
  }
}
