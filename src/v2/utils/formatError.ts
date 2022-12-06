import { ErrorCode } from '@ethersproject/logger';

interface EthersError {
  code: ErrorCode;
  reason: string;
  version: string;
  operation?: string;
  argument?: string;
  value?: any;
}

function isEthersError(error: unknown): error is EthersError {
  return (error as EthersError).code !== undefined;
}

export function formatError(error: unknown): string {
  if (typeof error === 'string') {
    return error;
  }

  if (isEthersError(error)) {
    return error.reason;
  }

  if (error instanceof Error) {
    return error.message;
  }

  return 'Unknown error';
}
