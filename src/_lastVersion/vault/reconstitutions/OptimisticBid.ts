import { Constructor } from '../core/Vault';

export function OptimisticBid<TBase extends Constructor>(Base: TBase) {
  return class extends Base {
    constructor(...args: any[]) {
      super(...args);
    }

    public optimistic() {
      return 'optimistic' + this.vaultAddress;
    }
  };
}
