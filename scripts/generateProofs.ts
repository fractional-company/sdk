import { JsonRpcProvider } from '@ethersproject/providers';
import 'dotenv/config';
import fs from 'fs';
import path from 'path';
import prettier from 'prettier';
import { Chain, ContractAddresses, getContractAddress } from '../src/';
import { LPDA__factory } from '../src/v2/contracts';
import { Contract } from '../src';

const { RPC_API_URL } = process.env;
if (!RPC_API_URL) {
  throw new Error('Missing rpc api url');
}

const provider = new JsonRpcProvider(RPC_API_URL);

const config = {
  chains: [Chain.Mainnet, Chain.Goerli],
  targetFile: 'proofs.ts',
  outDir: path.join(__dirname, '../src/v2/proofs')
};

const generateProofs = async (
  chain: Chain
): Promise<{
  mintProof: string[];
  redeemProof: string[];
  burnProof: string[];
  withdrawERC20Proof: string[];
  withdrawERC721Proof: string[];
  withdrawERC1155proof: string[];
  batchWithdrawERC1155Proof: string[];
}> => {
  // LPDA Contract
  const lpdaAddress = getContractAddress(Contract.LPDA, chain);
  const optimisticAddress = getContractAddress(Contract.OptimisticBid, chain);
  const lpda = LPDA__factory.connect(lpdaAddress, provider);

  // Merkle Tree
  const modules = [lpdaAddress, optimisticAddress];
  const merkleTree = await lpda.generateMerkleTree(modules);

  const numberOfProofs = 7;

  const promises: Promise<string[]>[] = [];
  for (let i = 0; i < numberOfProofs; i++) {
    promises.push(lpda.getProof(merkleTree, i));
  }

  const [
    mintProof,
    redeemProof,
    burnProof,
    withdrawERC20Proof,
    withdrawERC721Proof,
    withdrawERC1155proof,
    batchWithdrawERC1155Proof
  ] = await Promise.all(promises);

  return {
    mintProof,
    redeemProof,
    burnProof,
    withdrawERC20Proof,
    withdrawERC721Proof,
    withdrawERC1155proof,
    batchWithdrawERC1155Proof
  };
};

const main = async (): Promise<void> => {
  const { chains, outDir, targetFile } = config;
  const outFilePath = path.join(outDir, targetFile);

  // Create directories if it doesn't exist
  if (!fs.existsSync(outDir)) {
    fs.mkdirSync(outDir);
  }

  // Reset file content
  if (fs.existsSync(outFilePath)) {
    fs.writeFileSync(outFilePath, '');
  }

  // Create file content
  let allProofs = '';

  for (const chain of chains) {
    const proofs = await generateProofs(chain);
    allProofs += `${chain}: ${JSON.stringify(proofs)}`;
  }

  const data = `export const proofs = { ${allProofs} }`;

  // Format the code
  const prettierOptions = prettier.resolveConfig.sync(__dirname) || {};
  const options = { ...prettierOptions, parser: 'typescript' };
  const formatted = prettier.format(data, options);

  // Write to file
  fs.writeFileSync(outFilePath, formatted);
};

void main();
