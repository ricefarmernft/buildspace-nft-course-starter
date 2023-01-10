import React, { useEffect, useState } from "react";
import "./styles/App.css";
import twitterLogo from "./assets/twitter-logo.svg";
import { ethers } from "ethers";
import myEpicNFT from "./utils/MyEpicNFT.json";

// Constants
const TWITTER_HANDLE = "RiceFarmerNFT";
const TWITTER_LINK = `https://twitter.com/${TWITTER_HANDLE}`;
const OPENSEA_LINK = "https://testnets.opensea.io/assets/";
const CONTRACT_ADDRESS = "0x58aC93C4292191A664CA39e01F9E79fdAc3CcB93";
const MAX_SUPPLY = "1000";

const App = () => {
  // Store users public wallet
  const [currentAccount, setCurrentAccount] = useState();
  const [totalMinted, setTotalMinted] = useState("0");
  const [totalSupply, setTotalSupply] = useState(MAX_SUPPLY);
  const [loading, setLoading] = useState(false);

  const checkIfWalletIsConnected = async () => {
    // First make sure we have access to window.ethereum
    const { ethereum } = window;

    if (!ethereum) {
      console.log("Make sure you have metamask!");
      return;
    } else {
      console.log("We have the ethereum object", ethereum);
      console.log(
        await ethereum.request({
          method: "eth_accounts",
        })
      );
    }

    // Check access to user's wallet
    const accounts = await ethereum.request({ method: "eth_accounts" });

    // Use first account if multiple authorized accounts
    if (accounts.length !== 0) {
      const account = accounts[0];
      console.log("Found an authorized account:", account);
      setCurrentAccount(account);
      setupEventListener();
    } else {
      console.log("No authorized account found");
    }
  };

  // Connect wallet method
  const connectWallet = async () => {
    try {
      const { ethereum } = window;

      if (!ethereum) {
        alert("No Metamask Detected!");
        return;
      }
      // Request account access
      const accounts = await ethereum.request({
        method: "eth_requestAccounts",
      });
      console.log("Connected", accounts[0]);
      checkNetwork();
      setCurrentAccount(accounts[0]);
      setupEventListener();
    } catch (error) {
      console.log(error);
    }
  };

  // Check Blockchain Network
  const checkNetwork = async () => {
    const { ethereum } = window;

    let chainId = await ethereum.request({ method: "eth_chainId" });
    console.log("Connected to chain " + chainId);

    const goerliChainId = "0x5";
    if (chainId !== goerliChainId) {
      alert("You are not connected to the Goerli Test Network!");
    }
  };

  // Set Event
  const setupEventListener = async () => {
    try {
      const { ethereum } = window;

      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const connectedContract = new ethers.Contract(
          CONTRACT_ADDRESS,
          myEpicNFT.abi,
          signer
        );

        connectedContract.on("NewEpicNFTMinted", (from, tokenId) => {
          console.log(from, tokenId.toNumber());
          setTotalMinted(tokenId.toNumber() + 1);
          alert(
            `Hey there! We've minted your NFT and sent it to your wallet. Here's the link: ${OPENSEA_LINK}${CONTRACT_ADDRESS}/${tokenId.toNumber()}`
          );
        });

        console.log("Successfully setup event listener.");
      } else {
        console.log("Ethereum object doesn't exist");
      }
    } catch (error) {
      console.log(error);
    }
  };

  // Mint NFT
  const askContractToMint = async () => {
    setLoading(true);
    try {
      const { ethereum } = window;

      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const connectedContract = new ethers.Contract(
          CONTRACT_ADDRESS,
          myEpicNFT.abi,
          signer
        );

        console.log("Allow wallet to pay gas...");
        let nftTxn = await connectedContract.makeAnEpicNFT();

        console.log("Mining...please wait.");
        await nftTxn.wait();

        console.log(
          `Mined, see transaction: https://goerli.etherscan.io/tx/${nftTxn.hash}`
        );
      } else {
        console.log("Ethereum object doesn't exist");
      }
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  // Render Methods
  const renderNotConnectedContainer = () => (
    <button
      onClick={connectWallet}
      className="cta-button connect-wallet-button"
    >
      Connect to Wallet
    </button>
  );

  // Get Total NFTs Minted
  const getTotalNfts = async () => {
    try {
      const { ethereum } = window;

      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const connectedContract = new ethers.Contract(
          CONTRACT_ADDRESS,
          myEpicNFT.abi,
          signer
        );

        const totalSupply = await connectedContract.getTotalSupply();
        console.log(totalSupply._hex.toString().substring(3));
        setTotalMinted(totalSupply._hex.toString().substring(3));
      }
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    checkIfWalletIsConnected();
    getTotalNfts();
  }, []);

  return (
    <div className="App">
      <div className="container">
        <div className="header-container">
          <p className="header gradient-text">My NFT Collection</p>
          <p className="sub-text">
            Each unique. Each beautiful. Discover your NFT today.
          </p>
          {currentAccount && (
            <p className="sub-text">Logged in as: {currentAccount}</p>
          )}
          {currentAccount === undefined ? (
            renderNotConnectedContainer()
          ) : loading === false ? (
            <button
              onClick={askContractToMint}
              className="cta-button connect-wallet-button"
            >
              Mint NFT
            </button>
          ) : (
            <div className="loader"></div>
          )}
        </div>
        <div className="body-container">
          <h3>Total Minted</h3>
          <p>
            {totalMinted}/{totalSupply}
          </p>
          <p>{CONTRACT_ADDRESS}</p>
        </div>
        <div className="footer-container">
          <img alt="Twitter Logo" className="twitter-logo" src={twitterLogo} />
          <a
            className="footer-text"
            href={TWITTER_LINK}
            target="_blank"
            rel="noreferrer"
          >{`built by @${TWITTER_HANDLE}`}</a>
          <button className="opensea-button">
            <a
              href="https://testnets.opensea.io/collection/ricenft-thqvsohnjk"
              target="_blank"
              rel="noreferrer"
            >
              🌊 View Collection on OpenSea
            </a>
          </button>
        </div>
      </div>
    </div>
  );
};

export default App;
