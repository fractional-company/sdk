import { JsonRpcProvider } from '@ethersproject/providers';
import 'dotenv/config';
import { Wallet } from 'ethers';
import { Chains, Tessera } from '../src';

// Instantiate a tessera client
const { WALLET_PRIVATE_KEY, RPC_API_URL } = process.env;
if (!WALLET_PRIVATE_KEY || !RPC_API_URL) {
  throw new Error('Missing environment variables');
}

const provider = new JsonRpcProvider(RPC_API_URL);
const wallet = new Wallet(WALLET_PRIVATE_KEY, provider);

const tessera = Tessera(wallet, {
  chainId: Chains.Rinkeby,
  variant: 'DEFAULT'
});

describe('Tessera constructor', () => {
  it(`should store "isReadOnly" property as a boolean`, () => {
    expect(typeof tessera.isReadOnly).toBe('boolean');
  });
});
