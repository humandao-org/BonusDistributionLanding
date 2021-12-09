import WalletConnectProvider from "@walletconnect/web3-provider";
import Web3Modal from "web3modal";

// set chain id and rpc mapping in provider options
const providerOptions = {
  walletconnect: {
    package: WalletConnectProvider,
    options: {
      rpc: {
        1: 'https://mainnet.infura.io/v3/9aa3d95b3bc440fa88ea12eaa4456161',
        56: 'https://bsc-dataseed1.binance.org',
        137: 'https://rpc-mainnet.maticvigil.com/'
      },
      // chainId: 56
      //chainId: 1
    }
  }
}

export async function createProvider() {
  const web3Modal = new Web3Modal({
    network: "mainnet", // optional
    cacheProvider: true, // optional
    providerOptions // required
  });
  console.log('web3 modal created')
  const provider = await web3Modal.connect();
  console.log('after awaiting connect method')
  const result = await web3Modal.toggleModal();
  console.log('after awaiting toggle modal', result)

  return provider
}

// const accounts = await newWeb3.eth.getAccounts();
// console.log(accounts);


// For importing version 2 
// import WalletConnectClient from "@walletconnect/client";

/* for using versoin 2
export async function createProvider() {
  const client = await WalletConnectClient.init({
    relayProvider: "wss://relay.walletconnect.com",
    metadata: {
      name: "Example Dapp",
      description: "Example Dapp",
      url: "#",
      icons: ["https://walletconnect.com/walletconnect-logo.png"],
    },
  })
  return client
} 
*/

/*
import Web3 from "web3";
import WalletConnectProvider from "@walletconnect/web3-provider";

//  Create WalletConnect Provider
const provider = new WalletConnectProvider({
  infuraId: "27e484dcd9e3efcfd25a83a78777cdf1", // Required
  // infuraId: "27e484dcd9e3efcfd25a83a78777cdf1",
  qrcode: false,
  qrcodeModalOptions: {
    mobileLinks: [
      "rainbow",
      "metamask",
      "argent",
      "trust",
      "imtoken",
      "pillar",
    ],
    desktopLinks: [
      "metamask",
      "trust",
      "encrypted ink",
    ]
  }
});

//  Create Web3 provider
export async function createProvider() {
  await provider.enable()
  return new Web3(provider);
}
*/


/*
// Using version1 standalone client

import WalletConnect from "@walletconnect/client";
import QRCodeModal from "@walletconnect/qrcode-modal";

// Create a connector
export const connector = new WalletConnect({
  bridge: "https://bridge.walletconnect.org", // Required
  qrcodeModal: QRCodeModal,
});
*/

/*
// Check if connection is already established
if (!connector.connected) {
  // create new session
  connector.createSession();
}
*/