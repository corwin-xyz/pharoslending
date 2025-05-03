import USDCToken from './ABI/USDCToken.json'
import ETHToken from './ABI/ETHToken.json'
import lendBorrow from './ABI/lendBorrow.json'

export const contractsData = {
  USDC: {
    address: `0xd1bf34a865b0956bc1624bc932fb9f9d9deaa1ec`,
    abi: USDCToken,
  },
  ETH: {
    address: `0x1b71576f05579419ecc1b879fdedc5fe4a5fafee`,
    abi: ETHToken,
  },
  lendBorrow: {
    address: `0xb7975e1b1621697112dc394a402a195b6b075ba1`,
    abi: lendBorrow,
  },
};




export const walletActivity = {
    high: [
      '0xa983919B14E6e21A165f8108316caaa9e7176963',
      '0xC3d4...',
      '0xE5f6...',
    ],
    medium: [
      '0x40FD7F7307336355FC34c9b18f3C5AA415912163',
      '0xD9e0...',
      '0xF1a2...',
    ],
    low: [
      '0x39b6D42a369fA114D994d5e7199D0642a2e0F729',
      '0x5678...',
      '0x9abc...',
    ],
  };

