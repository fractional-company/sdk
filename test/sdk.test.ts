/* eslint-disable no-console */

import { JsonRpcProvider } from '@ethersproject/providers';
import 'dotenv/config';
import { BigNumber, Wallet } from 'ethers';
import { parseEther } from 'ethers/lib/utils';
import { ArtEnjoyer, Chain, TokenStandard, VaultFactory } from '../src/';

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
describe('LPDA', () => {
  it('should deploy an LPDA vault', async () => {
    return;
    const startTime = ((new Date().valueOf() + 60000) / 1000).toFixed(0); // 1 minute from now
    const seconds = 1200; // 10 minutes from now
    const endTime = (parseInt(startTime) + seconds).toFixed(0);
    const dropPerSecond = parseEther('0.000000000000000001').toString();
    const startPrice = BigNumber.from(dropPerSecond).mul(seconds);
    const endPrice = '0';

    const tx = await vaultFactory.deployArtEnjoyer({
      curator: wallet.address,
      tokenAddress: '0x1652F52A6581031bb220a280e6dC68629dE72602',
      tokenId: '4476',
      startTime,
      endTime,
      dropPerSecond,
      startPrice,
      endPrice,
      minBid: '0',
      supply: '1000'
    });

    expect(tx).toBeDefined();
    console.log(tx);
  });

  it('should enter a bid', async () => {
    return;
    const vault = new ArtEnjoyer(
      '0xee3a81e8e73d14954a3d90c45429fceac25dffce',
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

    const tx = await vault.redeemNTFCurator('0x1652F52A6581031bb220a280e6dC68629dE72602', '4466');
    console.log(tx);
  });

  it('should settle the auction (address)', async () => {
    return;
    const vault = new ArtEnjoyer(
      '0xee3a81e8e73d14954a3d90c45429fceac25dffce',
      wallet,
      Chain.Goerli
    );

    const tx = await vault.settleAddress();
    console.log(tx);
  });

  it('should settle the auction (batch)', async () => {
    return;
    const vault = new ArtEnjoyer(
      '0xee3a81e8e73d14954a3d90c45429fceac25dffce',
      wallet,
      Chain.Goerli
    );

    const tx = await vault.settleAllAddresses();
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
    return;
    const vault = new ArtEnjoyer(
      '0x1e03462886f7672ebe9d2825f67fb897011e09a3',
      wallet,
      Chain.Goerli
    );

    const balance = await vault.getBalanceContributed(wallet.address);
    const x = await vault.getNumMinted(wallet.address);
    console.log(x);
    console.log(balance);
  });

  it('should get the list of bids', async () => {
    return;
    const vault = new ArtEnjoyer(
      '0xee3a81e8e73d14954a3d90c45429fceac25dffce',
      wallet,
      Chain.Goerli
    );

    const bids = await vault.getBids();
    console.log(bids);
  });

  it('should get the list of minters', async () => {
    return;
    const vault = new ArtEnjoyer(
      '0xee3a81e8e73d14954a3d90c45429fceac25dffce',
      wallet,
      Chain.Goerli
    );

    const minters = await vault.getMinters();
    console.log(minters);
  });

  it('should get the auction info', async () => {
    return;
    const vault = new ArtEnjoyer(
      '0xee3a81e8e73d14954a3d90c45429fceac25dffce',
      wallet,
      Chain.Goerli
    );

    const auction = await vault.getAuction();
    console.log(auction);
  });

  it('should allow curator to redeem the NFT on failure', async () => {
    return;
    const vault = new ArtEnjoyer(
      '0xee3a81e8e73d14954a3d90c45429fceac25dffce',
      wallet,
      Chain.Goerli
    );

    const auction = await vault.redeemNTFCurator(
      '0x1652F52A6581031bb220a280e6dC68629dE72602',
      '4476'
    );
    console.log(auction);
  });
});

describe('OptimisticBid', () => {
  it('should start a buyout', async () => {
    return;
    const vault = new ArtEnjoyer(
      '0x1652F52A6581031bb220a280e6dC68629dE72602',
      wallet,
      Chain.Goerli
    );

    const tx = await vault.startBuyout('1', '0.2');
    const awaited = await tx.wait();
    console.log(awaited);
  });

  it('should get auction info', async () => {
    return;
    const vault = new ArtEnjoyer(
      '0x38e51a262dbbc9c1d5227dc6fa16407fd6f3169c',
      wallet,
      Chain.Goerli
    );

    const tx = await vault.getAllBuyouts();
    console.log(tx);
  });

  it('should buy raes from pool', async () => {
    return;
    const vault = new ArtEnjoyer(
      '0x38e51a262dbbc9c1d5227dc6fa16407fd6f3169c',
      wallet,
      Chain.Goerli
    );

    const tx = await vault.buyRaes('1');
    console.log(tx);
  });

  it('should cash out proceeds', async () => {
    return;
    const vault = new ArtEnjoyer(
      '0x38e51a262dbbc9c1d5227dc6fa16407fd6f3169c',
      wallet,
      Chain.Goerli
    );

    const tx = await vault.cashProceeds();
    console.log(tx);
  });

  it('should redeem the NFT', async () => {
    return;
    const vault = new ArtEnjoyer(
      '0x6967812f478875abd4cf452972f99735bd99a507',
      wallet,
      Chain.Goerli
    );

    const tx = await vault.redeemNFT();
    console.log(tx);
  });

  it('should withdraw balances', async () => {
    return;
    const vault = new ArtEnjoyer(
      '0x38E51A262DbBC9c1D5227dC6FA16407fd6f3169c',
      wallet,
      Chain.Goerli
    );

    const tx = await vault.withdrawBalance();
    console.log(tx);
  });

  it('should get past bids', async () => {
    return;
    const vault = new ArtEnjoyer(
      '0x38E51A262DbBC9c1D5227dC6FA16407fd6f3169c',
      wallet,
      Chain.Goerli
    );

    const events = await vault.getBids();
    console.log(events);
  });

  it('should withdraw NFTs', async () => {
    return;
    const vault = new ArtEnjoyer(
      '0x6967812f478875abd4cf452972f99735bd99a507',
      wallet,
      Chain.Goerli
    );

    const tx = await vault.withdrawTokens([
      {
        address: '0x1652F52A6581031bb220a280e6dC68629dE72602',
        id: '4467',
        standard: TokenStandard.ERC721
      }
    ]);
    console.log(tx);
  });
});
