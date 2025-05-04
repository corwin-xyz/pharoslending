import USDCToken from './ABI/USDCToken.json';
import ETHToken from './ABI/ETHToken.json';
import lendBorrow from './ABI/lendBorrow.json';

export const contractsData = {
  USDC: {
    address: `0xd1BF34A865b0956BC1624bC932fB9f9D9DeAa1ec`,
    abi: USDCToken,
  },
  ETH: {
    address: `0x1b71576f05579419ecc1b879fdedc5fe4a5fafee`,
    abi: ETHToken,
  },
  lendBorrow: {
    address: `0xf8788ed8a82ef5fa566a32cb7298d51e8d9de787`,
    abi: lendBorrow,
  },
};

export const walletActivity = {
  high: [
    '0x40FD7F7307336355FC34c9b18f3C5AA415912163',
    '0xC3d4...',
    '0xE5f6...',
  ],
  medium: [
    '0xa983919B14E6e21A165f8108316caaa9e7176963',
    '0xD9e0...',
    '0xF1a2...',
  ],
  low: ['0x39b6D42a369fA114D994d5e7199D0642a2e0F729', '0x5678...', '0x9abc...'],
};
