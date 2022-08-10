export const Targets: {
  [key: string]: string;
} = {
  Supply: 'Supply',
  Transfer: 'Transfer'
};

export const Selectors = {
  Supply: {
    Mint: '0x40c10f19',
    Burn: '0x9dc29fac'
  },
  Transfer: {
    ERC20Transfer: '0xe59fdd36',
    ERC721TransferFrom: '0x18c4eeed',
    ERC1155TransferFrom: '0x68e72e49',
    ERC1155BatchTransferFrom: '0x76aa79b2'
  }
};
