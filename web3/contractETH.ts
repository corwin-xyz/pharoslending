import Web3 from 'web3';
import { contractsData } from './resources';

let web3: Web3 | undefined;
let contractETH: any;

if (typeof window !== 'undefined' && typeof window.ethereum !== 'undefined') {
  try {
    // Initialize web3 with the provider injected by MetaMask or other Ethereum wallets
    web3 = new Web3(window.ethereum);

    // Request access to the user's Ethereum accounts
    window.ethereum
      .request({ method: 'eth_requestAccounts' })
      .then(() => {
        // Initialize contracts only after account access is granted
        contractETH = new web3.eth.Contract(
          contractsData.ETH.abi,
          contractsData.ETH.address
        );
        console.log('Contracts initialized');
      })
      .catch((error: any) => {
        console.error(
          'User denied account access or there was an error',
          error
        );
      });
  } catch (error) {
    console.error('Error initializing web3 or contract:', error);
  }
} else {
  console.log(
    'Ethereum wallet not detected. Please install MetaMask or another wallet.'
  );
}

export { web3, contractETH };
