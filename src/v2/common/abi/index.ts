import baseVault from './modules/baseVault.json';
import buyout from './modules/buyout.json';
import migration from './modules/migration.json';
import supply from './targets/supply.json';
import transfer from './targets/transfer.json';
import erc20 from './tokens/erc20.json';
import erc721 from './tokens/erc721.json';
import ferc1155 from './tokens/ferc1155.json';
import vault from './vaults/vault.json';
import vaultFactory from './vaults/vaultFactory.json';
import vaultRegistry from './vaults/vaultRegistry.json';

export const ABI = {
  baseVault,
  buyout,
  erc20,
  erc721,
  ferc1155,
  migration,
  supply,
  transfer,
  vault,
  vaultFactory,
  vaultRegistry
};
