import React, { useContext, useState } from "react";
import {
      useSDK,
      useContract,
      useAddress,
      useContractWrite,
      useSigner,
      ConnectWallet,
      
} from "@thirdweb-dev/react";
import { ThirdwebSDK } from "@thirdweb-dev/sdk";

import { ChainId, NATIVE_TOKEN_ADDRESS } from "@thirdweb-dev/sdk";
import { useRef,useEffect } from "react";
import styles from "../styles/Theme.module.css";
import { v4 as uuidv4 } from 'uuid';
import axios from 'axios';
import { useTransferNFT } from "@thirdweb-dev/react";






const FormExample = () => {
  const walletaddress=useAddress()
  const [savecontractAddress, setContractAddress] = useState("");


  const [status, setStatus] = useState('');
  
  const signer=useSigner()
  let sdk = new ThirdwebSDK("mumbai");
  const [file, setFile] = useState();
  const fileInputRef = useRef(null);
  const [formData, setFormData] = useState({});
  const [loading,setLoading]=useState('noloading')
  const [isPopupOpen, setIsPopupOpen] = useState(false);

  if(walletaddress){

    sdk = ThirdwebSDK.fromSigner(signer);
   }
 
   const handleOpenPopup = () => {
    setIsPopupOpen(true);
  };
  const handleClosePopup = () => {
    setIsPopupOpen(false);
  };


  const handleChange = (event) => {
    console.log(event.target.name, event.target.value)
    

    setFormData({

      ...formData,
      [event.target.name]: event.target.value
      
    }
    )
    ;
  }

  const handleSubmit = async (event) => {
    event.preventDefault();
    DeployContract();
   
    
  }


  async function DeployContract(event){
    console.log(walletaddress)
        setLoading("Deploying your Raffle Contract")
        try{

      var contractAddress = await sdk.deployer.deployReleasedContract("0x7C7591A9Aa435C5D92fb3b5CEa4a31F7627ae905", "Waffle",[


        walletaddress,
        formData.nftcontract,
        formData.ChainlinkVRFCoordinator,
        formData.ChainlinkLINKToken,
        formData.ChainlinkKeyHash,
        formData.ChainlinkFee,
        formData._nftID,
        formData._slotPrice,
        formData._numSlotsAvailable





      ], "1.0.0")
        setContractAddress(contractAddress)

   
        }
        catch(err){
          console.log(err)
          return;
          
        }



  setLoading("Approving NFT to Raffle Contract")
  try{
    const slotContract = await sdk.getContract(contractAddress);
    
    console.log(walletaddress)
    console.log(formData.nftcontract)
    console.log(formData._nftID)
    console.log(walletaddress)

    const data = await slotContract.call("onERC721Received", [walletaddress, formData.nftcontract, formData._nftID, []])
    }
  catch(err){
  console.log(err)
  return
    }

    setLoading("Transferring NFT to the Contract")
      try{
      const contract = await sdk.getContract(formData.nftcontract);
      await contract.erc721.transfer(contractAddress, parseInt(formData._nftID));
      }
      catch(err){

        console.log(err)
        return
      }

 
    setLoading("Saving your Contract Instance")
    const deployedContracts = {
      walletaddress:walletaddress,
      contractaddress:contractAddress,
      nftContract: formData.nftcontract,
      ChainlinkFee: formData.ChainlinkFee,
      Price:formData._slotPrice,
      // image: img,

      _numSlotsAvailable:parseInt(formData._numSlotsAvailable),
      tokenID: formData._nftID
    }

    try {
      // Send form data to the API endpoint
      await axios.post('/api/post_listings', deployedContracts);
      setStatus('Deployed');
      } catch (err) {
      setStatus('Error: ' + err);
      }
      setLoading("noloading")

  }



  return (
    <form onSubmit={handleSubmit} >
        <div className={styles.container}>

      <label>
      <input type="text" name="nftcontract" placeholder="NFT Contract"
          required
          value={formData.nftcontract}
         className={styles.textInput}             
         style={{ minWidth: "320px",marginTop: 10}}
        onChange={handleChange} />
    <br/>
      <input type="text" name="ChainlinkVRFCoordinator" placeholder="ChainlinkVRFCoordinator"
          required
          value={formData.ChainlinkVRFCoordinator}
         className={styles.textInput}             
         style={{ minWidth: "320px",marginTop: 10}}
        onChange={handleChange} />
 <br/>
      <input type="text" name="ChainlinkLINKToken" placeholder="ChainlinkLINKToken"
          required
          value={formData.ChainlinkLINKToken}
         className={styles.textInput}             
         style={{ minWidth: "320px",marginTop: 10}}
        onChange={handleChange} />
 <br/>
        <input type="text" name="ChainlinkKeyHash" placeholder="ChainlinkKeyHash"
          required
          value={formData.ChainlinkKeyHash}
         className={styles.textInput}             
         style={{ minWidth: "320px",marginTop: 10}}
        onChange={handleChange} />
 <br/>
    <input type="text" name="ChainlinkFee" placeholder="ChainlinkFee"
          required
          value={formData.ChainlinkFee}
         className={styles.textInput}             
         style={{ minWidth: "320px",marginTop: 10}}
        onChange={handleChange} />
         <br/>
            <input type="text" name="_nftID" placeholder="_nftID"
          required
          value={formData._nftID}
         className={styles.textInput}             
         style={{ minWidth: "320px",marginTop: 10}}
        onChange={handleChange} />
 <br/>
    <input type="text" name="_slotPrice" placeholder="_slotPrice"
          required
          value={formData._slotPrice}
         className={styles.textInput}             
         style={{ minWidth: "320px",marginTop: 10}}
        onChange={handleChange} />
         <br/>
            <input type="text" name="_numSlotsAvailable" placeholder="_numSlotsAvailable"
          required
          value={formData._numSlotsAvailable}
         className={styles.textInput}             
         style={{ minWidth: "320px",marginTop: 10}}
        onChange={handleChange} />
         <br/>
         <input type="text" name="deployedcontract" placeholder="Deployed Contract"
        
          value={savecontractAddress}
         className={styles.textInput}             
         style={{ minWidth: "320px",marginTop: 10}}
         disabled
          onChange={handleChange} />
      {loading === "noloading" ? (

      // JSX to render when loading is "noloading"
      <></> // Replace with your desired JSX
       ) : (

      // JSX to render when loading has a different value
      <div className={styles.blur}>

      <p className={styles.popup} >{loading}</p>
      </div>
    )}  

       
      
        
      </label>


      
      <br />
     
      <button className={styles.mainButton}
      type="submit"
      
      >Create Raffle</button>
     
      </div>
        
    </form>

  );
}

export default FormExample;