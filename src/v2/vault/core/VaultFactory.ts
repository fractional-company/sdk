import { BigNumberish, Signer } from 'ethers';
import { hexStripZeros, isAddress } from 'ethers/lib/utils';
import { Chain, Contract, getProofs } from '../../constants';
import { LPDA__factory as LPDAFactory } from '../../contracts';
import { Connection, GasData } from '../../types/types';
import {
  estimateTransactionGas,
  executeTransaction,
  formatError,
  getContractAddress,
  isValidAmount,
  isValidChain,
  isValidConnection,
  isValidTimestamp,
  isValidTokenId
} from '../../utils';

interface FactoryReceipt {
  transactionHash: string;
  vaultAddress: string;
  tokenAddress: string;
  tokenId: string;
}

export class VaultFactory {
  public chainId: Chain;
  public isReadOnly: boolean;
  public connection: Connection;
  public modules?: string[];

  constructor(connection: Connection, chainId: Chain, modules?: string[]) {
    if (!isValidConnection(connection)) throw new Error('Invalid signer or provider');
    if (!isValidChain(chainId)) throw new Error('Invalid chain ID');

    this.chainId = chainId;
    this.connection = connection;
    this.isReadOnly = !Signer.isSigner(connection);
    this.modules = modules;
  }

  public async deployArtEnjoyer({
    curator,
    tokenAddress,
    tokenId,
    startTime,
    endTime,
    dropPerSecond,
    startPrice,
    endPrice,
    minBid,
    supply
  }: {
    curator: string;
    tokenAddress: string;
    tokenId: BigNumberish;
    startTime: BigNumberish;
    endTime: BigNumberish;
    dropPerSecond: BigNumberish;
    startPrice: BigNumberish;
    endPrice: BigNumberish;
    minBid: BigNumberish;
    supply: BigNumberish;
  }): Promise<FactoryReceipt> {
    const contract = LPDAFactory.connect(
      getContractAddress(Contract.LPDA, this.chainId, this.modules),
      this.connection
    );

    if (!isAddress(curator)) throw new Error('Invalid curator address');
    if (!isAddress(tokenAddress)) throw new Error('Invalid token address');
    if (!isValidTokenId(tokenId)) throw new Error('Invalid token ID');
    if (!isValidTimestamp(startTime)) throw new Error('Invalid start time');
    if (!isValidTimestamp(endTime)) throw new Error('Invalid end time');
    if (!isValidAmount(dropPerSecond)) throw new Error('Invalid drop per second');
    if (!isValidAmount(startPrice)) throw new Error('Invalid start price');
    if (!isValidAmount(endPrice)) throw new Error('Invalid end price');
    if (!isValidAmount(minBid)) throw new Error('Invalid min bid');
    if (!isValidAmount(supply)) throw new Error('Invalid supply');

    const numSold = 0;
    const curatorClaimed = 0;
    const info = [
      startTime,
      endTime,
      dropPerSecond,
      startPrice,
      endPrice,
      minBid,
      supply,
      numSold,
      curatorClaimed,
      curator
    ];

    const lpdaModule = getContractAddress(Contract.LPDA, this.chainId, this.modules);
    const optimisticBidModule = getContractAddress(
      Contract.OptimisticBid,
      this.chainId,
      this.modules
    );

    const modules: string[] = [lpdaModule, optimisticBidModule];
    const plugins: string[] = [];
    const selectors: string[] = [];
    const mintProof = getProofs(this.chainId).mintProof;

    try {
      const tx = await executeTransaction({
        connection: this.connection,
        contract: contract,
        method: 'deployVault',
        args: [modules, plugins, selectors, info, tokenAddress, tokenId, mintProof]
      });

      const txRes = await tx.wait();

      // event: VaultDeployed(address _vault, address _token, uint256 _tokenId)
      const topics = txRes.logs[2].topics;

      return {
        transactionHash: txRes.transactionHash,
        vaultAddress: hexStripZeros(topics[1]),
        tokenAddress: hexStripZeros(topics[2]),
        tokenId: parseInt(topics[3]).toString()
      };
    } catch (e) {
      throw new Error(formatError(e));
    }
  }

  // ======== Gas Estimation ========
  public estimateGas = {
    deployArtEnjoyer: async (args: {
      curator: string;
      tokenAddress: string;
      tokenId: BigNumberish;
      startTime: BigNumberish;
      endTime: BigNumberish;
      dropPerSecond: BigNumberish;
      startPrice: BigNumberish;
      endPrice: BigNumberish;
      minBid: BigNumberish;
      supply: BigNumberish;
    }): Promise<GasData> => {
      try {
        return await estimateTransactionGas({
          connection: this.connection,
          contract: LPDAFactory.connect(
            getContractAddress(Contract.LPDA, this.chainId, this.modules),
            this.connection
          ),
          method: 'deployVault',
          args: [
            [
              getContractAddress(Contract.LPDA, this.chainId, this.modules),
              getContractAddress(Contract.OptimisticBid, this.chainId, this.modules)
            ],
            [],
            [],
            [
              args.startTime,
              args.endTime,
              args.dropPerSecond,
              args.startPrice,
              args.endPrice,
              args.minBid,
              args.supply,
              0,
              0,
              args.curator
            ],
            args.tokenAddress,
            args.tokenId,
            getProofs(this.chainId).mintProof
          ]
        });
      } catch (e) {
        throw new Error(formatError(e));
      }
    }
  };
}
