/* eslint-disable */
import { SCHEMA_ERC1155, SCHEMA_ERC20 } from '@fractional-company/common';

export function isValidFractionSchema(schema: string): boolean {
  if (typeof schema !== 'string') return false;
  const formattedSchema = schema.toLowerCase();
  return (
    formattedSchema === SCHEMA_ERC1155.toLowerCase() ||
    formattedSchema === SCHEMA_ERC20.toLowerCase()
  );
}
