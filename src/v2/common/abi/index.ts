import baseVaultAbi from './modules/baseVault.json';
import buyoutAbi from './modules/buyout.json';
import migrationAbi from './modules/migration.json';
import supplyAbi from './targets/supply.json';
import transferAbi from './targets/transfer.json';
import erc20Abi from './tokens/erc20.json';
import erc721Abi from './tokens/erc721.json';
import ferc1155Abi from './tokens/ferc1155.json';
import vaultAbi from './vaults/vault.json';
import vaultFactoryAbi from './vaults/vaultFactory.json';
import vaultRegistryAbi from './vaults/vaultRegistry.json';

export const abi = {
  baseVaultAbi,
  buyoutAbi,
  erc20Abi,
  erc721Abi,
  ferc1155Abi,
  migrationAbi,
  supplyAbi,
  transferAbi,
  vaultAbi,
  vaultFactoryAbi,
  vaultRegistryAbi
};
