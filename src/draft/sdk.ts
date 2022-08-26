import { Chains, Variants } from './constants';
import { Connection } from './types/types';
import { isValidChain, isValidConnection } from './utils';

import DefaultClass from './classes/default';
import NounletsClass from './classes/nounlets';

interface VariantClasses {
  DEFAULT: DefaultClass;
  NOUNLETS: NounletsClass;
}

export function Tessera<K extends keyof VariantClasses>(
  connection: Connection,
  options: { chainId: Chains; variant: K } = {
    chainId: Chains.Mainnet,
    variant: Variants.Default as K
  }
): VariantClasses[K] {
  if (!isValidConnection(connection)) throw new Error('Connection must be a signer or provider');
  if (typeof options !== 'object' || options === null) throw new Error('Options must be an object');

  const optionsArgs = {
    chainId: options.chainId || Chains.Mainnet,
    variant: (options.variant as Variants) || Variants.Default
  };

  if (!isValidChain(optionsArgs.chainId)) throw new Error('Chain ID is not valid');

  const variants: VariantClasses = {
    DEFAULT: new DefaultClass(connection, optionsArgs),
    NOUNLETS: new NounletsClass(connection, optionsArgs)
  };

  const variant = variants[options.variant];
  if (!variant) throw new Error('Variant is not valid');
  return variant;
}

export default Tessera;
