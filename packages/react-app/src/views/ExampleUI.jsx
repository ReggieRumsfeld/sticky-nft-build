import { Button, Card, DatePicker, Divider, Input, Progress, Slider, Spin, Switch, message } from "antd";
import React, { useState, useEffect } from "react";
import { ethers, utils } from "ethers";
import { SyncOutlined } from "@ant-design/icons";

//const { ethers } = require("ethers");

import { Address, Balance, Events } from "../components";

export default function ExampleUI({
  address,
  mainnetProvider,
  localProvider,
  yourLocalBalance,
  price,
  tx,
  readContracts,
  writeContracts,
  userSigner
}) {
  
  const [master, setMaster] = useState();
  const [masterName, setMasterName] = useState();
  const [masterAddress, setMasterAddress] = useState();
  const [slave, setSlave] = useState();
  const [slaveName, setSlaveName] = useState();
  const [slaveAddress, setSlaveAddress] = useState();
  const [stickyAddress, setStickyAddress] = useState();
  const [target, setTarget] = useState();
  const [tokenId, setTokenId] = useState();
  //const [ownerOf, setOwnerOf] = useState();
  //const [ownsMaster, setOwnsMaster] = useState(false);
  //const [ownsSlave, setOwnsSlave] = useState(false);
  const [isSticky, setIsSticky] = useState(false);
  const [releaseTS, setReleaseTS] = useState(0);
  //const [released, setReleased] = useState(false);
  const [coolDown, setCoolDown] = useState(false);

  async function getOwner(id) {
    return await master.ownerOf(id);
  }
/*
  async function asyncSetOwnsMaster() {
    const owner = await getOwner(tokenId);
    if (userSigner.address == owner) setOwnsMaster(true);
  }

  async function asyncSetOwnsSlave() {
    const owner = await getOwner(tokenId);
    if (userSigner.address == owner) setOwnsSlave(true);
  }
  */

  async function getTimestamp() {
    return (await readContracts.StickyNft.provider.getBlock()).timestamp;
  }

  async function asyncSetSticky() {
    setIsSticky(await readContracts.StickyNft.isSticky(tokenId));
  }

  async function asyncSetReleaseTS() {
    const timestamp = await getTimestamp();
     const releaseTS = await readContracts.StickyNft.setForRelease(tokenId);
    if (releaseTS > 0) {
      setReleaseTS(releaseTS);
      console.log("Release TS: ", releaseTS);
      if (timestamp < releaseTS + 1200) setCoolDown(true);
    }
  }

  useEffect(() => {
  console.log("Running nameAndAddress")
    async function nameAndAdressPls() {
      if (readContracts && readContracts.StickyNft) {
        console.log ("F*cked up #1")
        const sticky = readContracts.StickyNft
        console.log("Sticky Address: ", sticky.address)
       setStickyAddress(sticky.address)
         console.log("F*cked up #2");
        const masterAddress = await sticky.master()
            console.log("MasterAddress: ", masterAddress)
            console.log("F*cked up #3");
        setMasterAddress(masterAddress)
            console.log("F*cked up #4");
        const iFace = writeContracts.NonFung1.interface;
        console.log("Interface: ", iFace)
        const provider = sticky.provider;
        const master = new ethers.Contract(masterAddress, iFace, provider)
        setMaster(master);
        setMasterName(await master.name());
        const slaveAddress = await sticky.sticky();
        setSlaveAddress(slaveAddress);
        const slave = new ethers.Contract(slaveAddress, iFace, userSigner)
        console.log("SLAVE: ", slave)
        setSlave(slave);
        setSlaveName(await slave.name());
      }
    }
    nameAndAdressPls()
},
  [readContracts]) 

  useEffect(() => {
    if (readContracts.StickyNft) {
      asyncSetSticky();
      asyncSetReleaseTS();
      //asyncSetOwnsMaster();
      //asyncSetOwnsSlave()
    }
  },
  [tokenId])
    
  return (
    <div>
      <div style={{ border: "1px solid #cccccc", padding: 16, width: 400, margin: "auto", marginTop: 64 }}>
        <h1>Sticky NFT:</h1>
        <Address address={stickyAddress} fontSize={22} />
        <h4>
          <i>Nothing life-changing... just a tool to keep together what belongs together! In this case:</i>
        </h4>
        {masterName}:{" "}
        <h4>
          <Address address={masterAddress} fontSize={16} />
        </h4>
        🖇️ <br></br>
        {slaveName}:{" "}
        <h4>
          <Address address={slaveAddress} fontSize={16} />
        </h4>
        <Divider />
        <h2>Token ID: {tokenId}</h2>
        <Divider />
        {/*
        ⚙ /////////// DO THE NFTS STICK? ////////
      */}
        <div style={{ margin: 8 }}>
          <h2>Do the NFTs stick*?</h2>
          <Input
            onChange={e => {
              setTarget(e.target.value);
            }}
          />
          <Button
            style={{ marginTop: 8 }}
            onClick={async () => {
              try {
                await getOwner(target);
              } catch (error) {
                return message.warning("Token has not been issued");
              }
              setTokenId(target);
            }}
          >
            Enter ID!
          </Button>{" "}
          <br></br>
          <br></br>
          <h4>
            {" "}
            {slaveName} attached to {masterName}: {isSticky ? "🟢" : "🔴"}{" "}
          </h4>
          <i>
            *{slaveName} only releasable by the owner of {masterName} with same id
          </i>
        </div>
        <Divider />
        {/*
        ⚙ /////// RELEASE ////////////
      */}
        <h2>Release/Withdraw Sticky NFT</h2>
        <h4> Set to be released: {releaseTS > 0 ? (coolDown ? "🧊" : "🟢") : "🔴"}</h4>
        <div style={{ margin: 8 }}>
          <Button
            style={{ marginTop: 8 }}
            disabled={releaseTS > 0 || !tokenId}
            onClick={async () => {
              if ((await getOwner(tokenId)) != userSigner.address) {
                return message.warning("Not executing: You are not the owner of the master");
              }
              const result = tx(writeContracts.StickyNft.releaseNFT(tokenId), update => {
                console.log("📡 Transaction Update:", update);
                if (update && (update.status === "confirmed" || update.status === 1)) {
                  asyncSetSticky();
                  asyncSetReleaseTS();
                  console.log("Update: ", update);
                  console.log(" 🍾 Transaction " + update.hash + " finished!");
                  console.log(
                    " ⛽️ " +
                      update.gasUsed +
                      "/" +
                      (update.gasLimit || update.gas) +
                      " @ " +
                      parseFloat(update.gasPrice) / 1000000000 +
                      " gwei",
                  );
                }
              });
            }}
          >
            Release sticky NFT
          </Button>
        </div>
        {/*
        ⚙ /////// WITHDRAW ////////////
      */}
        <div style={{ margin: 8 }}>
          <Button
            style={{ marginTop: 8 }}
            disabled={releaseTS == 0 && !coolDown}
            onClick={async () => {
              if ((await getOwner(tokenId)) != userSigner.address) {
                return message.warning("Not executing: You are not the owner of the master");
              }
              const result = tx(writeContracts.StickyNft.withdrawNFT(tokenId), update => {
                console.log("📡 Transaction Update:", update);
                if (update && (update.status === "confirmed" || update.status === 1)) {
                  asyncSetSticky();
                  asyncSetReleaseTS();
                  console.log(" 🍾 Transaction " + update.hash + " finished!");
                  console.log(
                    " ⛽️ " +
                      update.gasUsed +
                      "/" +
                      (update.gasLimit || update.gas) +
                      " @ " +
                      parseFloat(update.gasPrice) / 1000000000 +
                      " gwei",
                  );
                }
              });
            }}
          >
            Withdraw
          </Button>
        </div>
        <Divider />
        {/*
        ⚙ /////// CANCEL RELEASE ////////////
      */}
        <div style={{ margin: 8 }}>
          <Button
            style={{ marginTop: 8 }}
            disabled={releaseTS == 0}
            onClick={async () => {
              if ((await getOwner(tokenId)) != userSigner.address) {
                return message.warning("Not executing: You are not the owner of the master");
              }
              const result = tx(writeContracts.StickyNft.cancelRelease(tokenId), update => {
                console.log("📡 Transaction Update:", update);
                if (update && (update.status === "confirmed" || update.status === 1)) {
                  setReleaseTS(0);
                  console.log(" 🍾 Transaction " + update.hash + " finished!");
                  console.log(
                    " ⛽️ " +
                      update.gasUsed +
                      "/" +
                      (update.gasLimit || update.gas) +
                      " @ " +
                      parseFloat(update.gasPrice) / 1000000000 +
                      " gwei",
                  );
                }
              });
              console.log("awaiting metamask/web3 confirm result...", result);
              console.log(await result);
            }}
          >
            Cancel release
          </Button>
        </div>
        <Divider />
        {/*
        ⚙ /////// MAKE IT STICK ////////////
      */}
        <h2>Make the NFT stick!</h2>
        <div style={{ margin: 8 }}>
          <Button
            style={{ marginTop: 8 }}
            disabled={isSticky || releaseTS > 0 || !tokenId}
            onClick={async () => {
              if ((await getOwner(tokenId)) != userSigner.address) {
                return message.warning("Not executing: You are not the owner of the master");
              }
              const result = tx(
                slave.transferFrom(userSigner.address, writeContracts.StickyNft.address, tokenId),
                update => {
                  console.log("📡 Transaction Update:", update);
                  if (update && (update.status === "confirmed" || update.status === 1)) {
                    setReleaseTS(0);
                    console.log(" 🍾 Transaction " + update.hash + " finished!");
                    console.log(
                      " ⛽️ " +
                        update.gasUsed +
                        "/" +
                        (update.gasLimit || update.gas) +
                        " @ " +
                        parseFloat(update.gasPrice) / 1000000000 +
                        " gwei",
                    );
                  }
                },
              );
              console.log("awaiting metamask/web3 confirm result...", result);
              console.log(await result);
            }}
          >
            Make it stick
          </Button>
        </div>
        <Divider />
        {/* use utils.formatEther to display a BigNumber: */}
        <h2>Your Balance: {yourLocalBalance ? utils.formatEther(yourLocalBalance) : "..."}</h2>
        <div>OR</div>
        <Balance address={address} provider={localProvider} price={price} />
      </div>
      {/*
        📑 Maybe display a list of events?
          (uncomment the event and emit line in YourContract.sol! )
      
      <Events
        contracts={readContracts}
        contractName="YourContract"
        eventName="SetPurpose"
        localProvider={localProvider}
        mainnetProvider={mainnetProvider}
        startBlock={1}
      />
      <Events
        contracts={readContracts}
        contractName="NonFung1"
        eventName="Transfer"
        localProvider={localProvider}
        mainnetProvider={mainnetProvider}
        startBlock={1}
      />
      <Events
        contracts={readContracts}
        contractName="NonFung2"
        eventName="Transfer"
        localProvider={localProvider}
        mainnetProvider={mainnetProvider}
        startBlock={1}
      />
      */}
      <Events
        contracts={readContracts}
        contractName="StickyNft"
        eventName="Release"
        localProvider={localProvider}
        mainnetProvider={mainnetProvider}
        startBlock={1}
      />
    </div>
  );
}
