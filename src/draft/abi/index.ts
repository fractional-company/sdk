import baseVault from './default/baseVault.json';
import buyout from './default/buyout.json';
import ferc1155 from './default/ferc1155.json';
import migration from './default/migration.json';
import supply from './default/supply.json';
import transfer from './default/transfer.json';
import vault from './default/vault.json';
import vaultFactory from './default/vaultFactory.json';
import vaultRegistry from './default/vaultRegistry.json';

// Nounlets
import nounletsAuction from './nounlets/auction.json';
import nounletsErc1155B from './nounlets/erc1155b.json';
import nounletsSupply from './nounlets/supply.json';
import nounletsTransfer from './nounlets/transfer.json';
import nounletsVault from './nounlets/vault.json';
import nounletsVaultFactory from './nounlets/vaultFactory.json';
import nounletsVaultRegistry from './nounlets/vaultRegistry.json';

// Tokens
import erc20 from './tokens/erc20.json';
import erc721 from './tokens/erc721.json';

export const defaultABI = {
  baseVault,
  buyout,
  ferc1155,
  migration,
  supply,
  transfer,
  vault,
  vaultFactory,
  vaultRegistry
};

export const nounletsABI = {
  auction: nounletsAuction,
  erc1155B: nounletsErc1155B,
  supply: nounletsSupply,
  transfer: nounletsTransfer,
  vault: nounletsVault,
  vaultFactory: nounletsVaultFactory,
  vaultRegistry: nounletsVaultRegistry
};

export const tokensABI = {
  erc20,
  erc721
};
