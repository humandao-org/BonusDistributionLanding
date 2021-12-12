// import Web3 from "web3";
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

export var web3provider = null

export async function createProvider() {
  const web3Modal = new Web3Modal({
    network: "mainnet", // optional
    cacheProvider: true, // optional
    providerOptions // required
  });
  const provider = await web3Modal.connect();
  await web3Modal.toggleModal();
  web3provider = provider
  return provider
}

export const claimABI = [
    {"inputs":
      [
        {"internalType":"address","name":"token_","type":"address"},
        {"internalType":"bytes32","name":"merkleRoot_","type":"bytes32"},
        {"internalType":"address","name":"humanDAOGenesisNFT_","type":"address"}
      ],"stateMutability":"nonpayable","type":"constructor"},
    {"anonymous":false,"inputs":[
        {"indexed":false,"internalType":"uint256","name":"index","type":"uint256"},
        {"indexed":false,"internalType":"address","name":"account","type":"address"},
        {"indexed":false,"internalType":"uint256","name":"amount","type":"uint256"}
      ],"name":"Claimed","type":"event"},
    {"anonymous":false,"inputs":
      [
        {"indexed":true,"internalType":"address","name":"previousOwner","type":"address"},
        {"indexed":true,"internalType":"address","name":"newOwner","type":"address"}
      ],"name":"OwnershipTransferred","type":"event"},
    {"anonymous":false,"inputs":[{"indexed":false,"internalType":"address","name":"account","type":"address"}],"name":"Paused","type":"event"},
    {"anonymous":false,"inputs":[{"indexed":false,"internalType":"address","name":"account","type":"address"}],"name":"Unpaused","type":"event"},
    {"inputs":
      [
        {"internalType":"address","name":"account_","type":"address"},
        {"internalType":"uint256","name":"amount_","type":"uint256"}
      ],"name":"calculateMaxDistribution","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},
    {"inputs":
      [
        {"internalType":"uint256","name":"index","type":"uint256"},
        {"internalType":"address","name":"account","type":"address"},
        {"internalType":"uint256","name":"amount","type":"uint256"},
        {"internalType":"bytes32[]","name":"merkleProof","type":"bytes32[]"}
      ],"name":"claim","outputs":[],"stateMutability":"nonpayable","type":"function"},
    {"inputs":[],"name":"humanDAONFT","outputs":[{"internalType":"contract HumanDaoGenesisNFT","name":"","type":"address"}],"stateMutability":"view","type":"function"},
    {"inputs":[{"internalType":"uint256","name":"index","type":"uint256"}],"name":"isClaimed","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"view","type":"function"},
    {"inputs":[],"name":"merkleRoot","outputs":[{"internalType":"bytes32","name":"","type":"bytes32"}],"stateMutability":"view","type":"function"},
    {"inputs":[],"name":"owner","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},
    {"inputs":[],"name":"pause","outputs":[],"stateMutability":"nonpayable","type":"function"},
    {"inputs":[],"name":"paused","outputs":[{"internalType":"bool","name":"","type":"bool"}],"stateMutability":"view","type":"function"},
    {"inputs":[],"name":"renounceOwnership","outputs":[],"stateMutability":"nonpayable","type":"function"},
    {"inputs":[],"name":"token","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},
    {"inputs":[{"internalType":"address","name":"beneficiary_","type":"address"}],"name":"transferNftOwnership","outputs":[],"stateMutability":"nonpayable","type":"function"},
    {"inputs":[{"internalType":"address","name":"newOwner","type":"address"}],"name":"transferOwnership","outputs":[],"stateMutability":"nonpayable","type":"function"},
    {"inputs":[{"internalType":"address","name":"_token","type":"address"}],"name":"transferRemainingTokens","outputs":[],"stateMutability":"nonpayable","type":"function"},
    {"inputs":[],"name":"unpause","outputs":[],"stateMutability":"nonpayable","type":"function"}
  ]

export const ERC20TransferABI = [
  {
    constant: false,
    inputs: [
      {
        name: "_to",
        type: "address",
      },
      {
        name: "_value",
        type: "uint256",
      },
    ],
    name: "transfer",
    outputs: [
      {
        name: "",
        type: "bool",
      },
    ],
    payable: false,
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    constant: true,
    inputs: [
      {
        name: "_owner",
        type: "address",
      },
    ],
    name: "balanceOf",
    outputs: [
      {
        name: "balance",
        type: "uint256",
      },
    ],
    payable: false,
    stateMutability: "view",
    type: "function",
  },
]


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