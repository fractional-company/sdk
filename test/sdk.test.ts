import { JsonRpcProvider } from '@ethersproject/providers';
import 'dotenv/config';
import { Wallet } from 'ethers';
import { parseEther } from 'ethers/lib/utils';
import { ArtEnjoyer, Chain, VaultFactory } from '../src/';

// Create a wallet instance from a private key
const { WALLET_PRIVATE_KEY, RPC_API_URL } = process.env;
if (!WALLET_PRIVATE_KEY || !RPC_API_URL) {
  throw new Error('Missing environment variables');
}

const provider = new JsonRpcProvider(RPC_API_URL);
const wallet = new Wallet(WALLET_PRIVATE_KEY, provider);

// Contracts
const vaultFactory = new VaultFactory(wallet, Chain.Goerli);

// Jest config
jest.setTimeout(60000);

// Tests
describe('Art Enjoyer', () => {
  it('should deploy an Art Enjoyer vault', async () => {
    return;
    const tx = await vaultFactory.deployArtEnjoyer({
      curator: wallet.address,
      tokenAddress: '0x1652F52A6581031bb220a280e6dC68629dE72602',
      tokenId: '4467',
      startTime: ((new Date().valueOf() + 60000) / 1000).toFixed(0), // 1 minute from now
      endTime: ((new Date().valueOf() + 600000) / 1000).toFixed(0), // 10 minutes from now
      dropPerSecond: parseEther('0.0001').toString(),
      startPrice: parseEther('0.1').toString(),
      endPrice: parseEther('0.001').toString(),
      minBid: '0',
      supply: '1'
    });

    expect(tx).toBeDefined();
    console.log(tx);
  });

  it('should enter a bid', async () => {
    return;
    const vault = new ArtEnjoyer(
      '0x6967812f478875abd4cf452972f99735bd99a507',
      wallet,
      Chain.Goerli
    );

    const tx = await vault.enterBid('1');
    console.log(tx);
  });

  it('should redeem the NFT', async () => {
    return;
    const vault = new ArtEnjoyer(
      '0x6967812f478875abd4cf452972f99735bd99a507',
      wallet,
      Chain.Goerli
    );

    const tx = await vault.redeemNft('0x1652F52A6581031bb220a280e6dC68629dE72602', '4466');
    console.log(tx);
  });

  it('should settle the auction (address)', async () => {
    return;
    const vault = new ArtEnjoyer(
      '0x6967812f478875abd4cf452972f99735bd99a507',
      wallet,
      Chain.Goerli
    );

    const tx = await vault.settleAddress();
    console.log(tx);
  });

  it('should settle the auction (curator)', async () => {
    return;
    const vault = new ArtEnjoyer(
      '0x6967812f478875abd4cf452972f99735bd99a507',
      wallet,
      Chain.Goerli
    );

    const tx = await vault.settleCurator();
    console.log(tx);
  });

  it('should get balance contributed by an address', async () => {
    const vault = new ArtEnjoyer(
      '0x6967812f478875abd4cf452972f99735bd99a507',
      wallet,
      Chain.Goerli
    );

    const balance = await vault.getBalanceContributed(wallet.address);
    console.log(balance);
  });
});
