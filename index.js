import { ethers } from "./ethers.js";
import { abi, contractAddress } from "./constants.js";

const connectButton = document.getElementById("connectButton");
const fundButton = document.getElementById("fund");
const balanceButton = document.getElementById("balanceButton");
const withdrawButton = document.getElementById("withdrawButton");
connectButton.onclick = connect;
fundButton.onclick = fund;
balanceButton.onclick = getBalance;
withdrawButton.onclick = withdraw;

async function connect() {
  if (window.ethereum) {
    await window.ethereum.request({ method: "eth_requestAccounts" });
    document.getElementById("connectButton").innerHTML = "Connected";
  } else {
    alert("Please install Metamask");
  }
}

async function getBalance() {
  if (window.ethereum) {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const balance = await provider.getBalance(contractAddress);
    console.log(ethers.utils.formatEther(balance));
  }
}

async function withdraw() {
  if (window.ethereum) {
    console.log("Withdrawing....");
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();
    const contract = new ethers.Contract(contractAddress, abi, signer);
    try {
      const transactionResponse = await contract.withdraw();
      await listenForTransactionMine(transactionResponse, provider);
    } 
    catch (error) {
      console.log(error);
    }
  }
}

async function fund() {
  const ethAmount = document.getElementById("ethAmount").value;
  console.log(`funding with ${ethAmount}...`);
  if (window.ethereum) {
    // provider/connection to the blockchain
    // signer/ wallet/ someone with some gas
    // get contract that we are need to interact with
    // using ABI & Address

    // We will the account connected to our metamask wallet
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();
    const contract = new ethers.Contract(contractAddress, abi, signer);

    try {
      const transactionResponse = await contract.fund({
        value: ethers.utils.parseEther(ethAmount),
      });
      // Listen for the transaction to be mined, wait until mined
      await listenForTransactionMine(transactionResponse, provider); // await is working as we are waiting for promise
      console.log("Done!");
    } catch (error) {
      console.log(error);
    }
  }
}

function listenForTransactionMine(transactionResponse, provider) {
  console.log(`Mining ${transactionResponse.hash}...`);
  // This promise will wait for until the listner is completed and will call resolve if its completed succesfully else reject
  return new Promise((resolve, reject) => {
    // listen for this transaction to finish( This listner will call callback-function once there is one confirmation)
    provider.once(transactionResponse.hash, (transactionReciept) => {
      // Print the number of confirmations
      console.log(
        `Completed with ${transactionReciept.confirmations} Confirmations`
      );
      resolve();
    });
  });
}
