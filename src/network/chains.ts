import { Chain } from '@wagmi/core/dist/types';

export const polygon: Chain = {
  id: 137,
  name: 'Polygon',
  network: 'polygon',
  nativeCurrency: {
    name: 'MATIC',
    symbol: 'MATIC',
    decimals: 18,
  },
  rpcUrls: {
    default: { http: ['https://polygon-rpc.com'] },
  },
  blockExplorers: {
    default: { name: 'Polygonscan', url: 'https://polygonscan.com' },
  },
  testnet: false,
};

export const bsc: Chain = {
  id: 56,
  name: 'Binance Smart Chain',
  network: 'bsc',
  nativeCurrency: {
    name: 'BNB',
    symbol: 'BNB',
    decimals: 18,
  },
  rpcUrls: {
    default: { http: ['https://bsc-dataseed.binance.org/'] },
  },
  blockExplorers: {
    default: { name: 'BSCScan', url: 'https://bscscan.com' },
  },
  testnet: false,
};

export const pharos: Chain = {
  id: 50002,
  name: 'Pharos Devnet',
  network: 'PHAROS',
  nativeCurrency: {
    name: 'PTT',
    symbol: 'PTT',
    decimals: 18,
  },
  rpcUrls: {
    default: { http: ['https://devnet.dplabs-internal.com'] },
  },
  blockExplorers: {
    default: { name: 'PharosScan', url: 'https://pharosscan.xyz/' },
  },
  testnet: false,
};
