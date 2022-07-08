import { SCHEMA_ERC1155, SCHEMA_ERC20 } from '@fractional-company/common';

export function isValidFractionSchema(schema: string): boolean {
  if (typeof schema !== 'string') return false;
  const formattedSchema = schema.toUpperCase();
  return (
    formattedSchema === SCHEMA_ERC1155.toUpperCase() ||
    formattedSchema === SCHEMA_ERC20.toUpperCase()
  );
}
