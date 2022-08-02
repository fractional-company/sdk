import { Chains, Variants } from './constants';
import { Connection, Options } from './types/types';
import { isValidChain, isValidConnection } from './utils';

import DefaultClass from './classes/default';
import NounletsClass from './classes/nounlets';

export function Tessera(
  connection: Connection,
  options: Options = {
    variant: Variants.Default,
    chainId: Chains.Mainnet
  }
): any {
  if (!isValidConnection(connection)) throw new Error('Connection must be a signer or provider');
  if (typeof options !== 'object' || options === null) throw new Error('Options must be an object');

  options = {
    variant: options.variant || Variants.Default,
    chainId: options.chainId || Chains.Mainnet
  };

  if (!isValidChain(options.chainId)) throw new Error('Chain ID is not valid');
  if (!Object.values(Variants).includes(options.variant)) throw new Error('Variant is not valid');

  const variants = {
    [Variants.Nounlets]: NounletsClass,
    [Variants.Default]: DefaultClass
  };

  const VariantClass = variants[options.variant];
  if (!VariantClass) throw new Error(`Invalid variant`);

  return new VariantClass(connection, options);
}
