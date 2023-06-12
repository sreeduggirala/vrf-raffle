import React, { useState } from "react";
import {
  useContract,
  useActiveListings,
  useContractMetadata,
  ThirdwebNftMedia,
  useAddress,
} from "@thirdweb-dev/react";
import { MARKETPLACE_ADDRESS } from "../const/contractAddresses";
import styles from "../styles/Theme.module.css";
import { ThirdwebSDK } from "@thirdweb-dev/sdk";
import { MediaRenderer } from "@thirdweb-dev/react";
import { useSigner } from "@thirdweb-dev/react";
import { useEffect } from "react";
import axios from 'axios';
import Router from 'next/router'
import { ethers } from "ethers";

export default function Listings() {
  const [loading,setLoading]=useState('noloading')
  const [formData, setFormData] = useState({
    _numSlotsAvailable: '',
  });
  const walletaddress=useAddress()
  const signer=useSigner()
  let sdk = new ThirdwebSDK("mumbai");
  const [data, setData] = useState([])
  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prevFormData) => ({
      ...prevFormData,
      [name]: value,
    }));
  };
  
  if(walletaddress){

   sdk = ThirdwebSDK.fromSigner(signer);

  }

  const readListings = () => {
    (async()=> {
      try { 
         const data = await axios.get('/api/read_listings');
        //  console.log('data', )
        
         setData(data?.data?.data)
        
          // Send form data to the API endpoint
         
          } catch (err) {
          console.log(err)
          }
    
     })()
   }
   useEffect(()=> {
    readListings()
         
          
    }, [])


   const handleSubmit=(e, id)=>{
    e.preventDefault();
    buySlot(id)


    }
    async function buySlot(id){            
    const dataShouldMint = data.find(item => item._id ===  id)
    const documentId =dataShouldMint._id
    const subtractBy = parseInt(formData._numSlotsAvailable);
    console.log(dataShouldMint)

    setLoading("Buying Slots")

  try{
    const tempvar=((dataShouldMint.Price/1000000000000000000)*parseInt(formData._numSlotsAvailable)).toString()

    const slotContract = await sdk.getContract(dataShouldMint.contractaddress);
    
    const data = await slotContract.call("purchaseSlot", [parseInt(formData._numSlotsAvailable)],{

      value: ethers.utils.parseEther(tempvar)



    }
    )      
    
  
  }
    catch(err){


  console.log(err)
  return
    }
    fetch('/api/update_api', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ documentId, subtractBy }),
    })
      .then((response) => response.json())
      .then((data) => {
        // Handle the response from the backend
        console.log(data);
      })
      .catch((error) => {
        // Handle any errors that occur during the request
        console.error('Error:', error);
      });


          Router.reload(window.location.pathname);
    setLoading("noloading")
    }
    async function handleSelectWinner(itemId){
      const dataShouldMint = data.find(item => item._id === itemId)
      console.log(dataShouldMint)
    try{
  setLoading("Getting Random Number from ChainLink VRF")
      const slotContract = await sdk.getContract(dataShouldMint.contractaddress);
      const data = await slotContract.call("collectRandomWinner")

    }
    catch(err){
 
     alert(err)
    } 
    setLoading("noloading")

    }
    async function handleDisburseWinner(itemId){
      const dataShouldMint = data.find(item => item._id === itemId)
      console.log(dataShouldMint)
    try{
    setLoading("Sending NFT to the Winner")
      const slotContract = await sdk.getContract(dataShouldMint.contractaddress);
      const data = await slotContract.call("disburseWinner")

    }
    catch(err){
 
     alert(err)
     setLoading("noloading")
     return
    }
    const {data : deletionResponse}= await  axios({
      method: 'DELETE',
      url: '/api/delete_api',
      headers: {
        'Content-Type': 'application/json'
      },
      data: {id: itemId}
    })
    setLoading("noloading")
    Router.reload(window.location.pathname);



    }

    return (
      <>
        {data.length && (
          <div className={styles.cardContainer}>
            {data.map((item) => (
              <form className={styles.card} key={item._id} onSubmit={(e) => handleSubmit(e, item._id)}>
                <div className={styles.imageContainer}>
                  
                </div>
                <div className={styles.infoContainer}>
                  <h1 className={styles.cardTitle} >Owner: {item.walletaddress}</h1>
                  <h1 className={styles.cardDescription}>NFT Contract: {item.nftContract}</h1>
                  <h1 className={styles.cardDescription}>RaffleContract {item.contractaddress}</h1>

                  <h1 className={styles.cardPrice}>{item.Price / 1000000000000000000} Matic</h1>
                  <h1 className={styles.cardTokenID}>TokenID: {item.tokenID}</h1>
                  <h1 className={styles.cardTokenID}>Available Slots {item._numSlotsAvailable}</h1>


                </div>
                <input type="text" name="_numSlotsAvailable" placeholder="Amount"
                required
                value={formData._numSlotsAvailable}
                className={styles.textInput}             
                style={{ minWidth: "320px",marginTop: 10}}
                onChange={handleChange} />
                <button className={styles.cardButton} type="submit">Buy Slot</button>
                {walletaddress === item.walletaddress && (
              <>
                <button className={styles.cardButton} type="button" onClick={() => handleSelectWinner( item._id)}>
                  Select Winner VRF Request
                </button>
            
                <button className={styles.cardButton} type="button" onClick={() => handleDisburseWinner(item._id)}>
                  Disburse Winner
                </button>
              </>
            )}
                {loading === "noloading" ? (

                // JSX to render when loading is "noloading"
                <></> // Replace with your desired JSX
                ) : (

                // JSX to render when loading has a different value
                <div className={styles.blur}>

                <p className={styles.popup} >{loading}</p>
                </div>
                )}  
              </form>
            ))}
          </div>
        )}
      </>
    );
}
