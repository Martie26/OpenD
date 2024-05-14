import React, { useEffect, useState } from "react";
import logo from "../../assets/logo.png";
import { Actor, HttpAgent } from "@dfinity/agent";
import { idlFactory } from "../../../declarations/nft";
import { Principal } from "@dfinity/principal";
import Button from "./Button";
import {opend} from "../../../declarations/opend";

function Item(props) {

  const [name, setName] = useState();

  const [owner, setOwner] = useState();

  const [image, setImage] = useState();

  const [button, setButton] = useState();

  const [priceInput, setPriceInput] = useState();
  let price;

  const [loaderHidden, setLoaderHidden] = useState(true);


  const id = props.id;


  const localhost = "http://localhost:8080/";
  const agent = new HttpAgent({host: localhost});
  //TODO: When deploying live, remove the following line of code:
  agent.fetchRootKey();

  
  let NFTActor;


  async function loadNFT() {
     NFTActor = await Actor.createActor(idlFactory, {
      agent,
      canisterId: id,
    });

      const name = await NFTActor.getName();
      const owner = await NFTActor.getOwner();

      const imgData = await NFTActor.getAsset();
      const imgContent = new Uint8Array(imgData);
      const img = URL.createObjectURL(
        new Blob([imgContent.buffer], {type: "image/png"})
      );

      setName(name);
      setOwner(owner.toText());
      setImage(img);




      setButton(<Button handleClick={handleSell} text={"Sell"} />)

  };



  useEffect(() => {
    loadNFT();
  }, []);




  function handleSell() {
    console.log("Sell Button Clicked");

    setPriceInput(
      <input
        placeholder="Price in DANG"
        type="number"
        className="price-input"
        value={price}
        onChange={(e) => price=e.target.value}
      />
    );

    setButton(<Button handleClick={sellItem} text={"Confirm"}/>)

  };



  async function sellItem() {
    setLoaderHidden(false);

    console.log("sell price = " + price);
    const listingResult = await opend.listItem(props.id, Number(price));
    console.log("listing = " + listingResult);

    if (listingResult == "Success") {
      const openDId = await opend.getOpenDCanisterId();
      const transferResults = await NFTActor.transferOwnership(openDId, true);
      console.log("transfer= " + transferResults);

        if (transferResults == "Success") {
          setLoaderHidden(true);
        }
    }
  };


  return (
    <div className="disGrid-item">
      <div className="disPaper-root disCard-root makeStyles-root-17 disPaper-elevation1 disPaper-rounded">
        <img
          className="disCardMedia-root makeStyles-image-19 disCardMedia-media disCardMedia-img"
          src={image}
        />


          <div hidden={loaderHidden} className="lds-ellipsis">
                  <div></div>
                  <div></div>
                  <div></div>
                  <div></div>
                </div>


        <div className="disCardContent-root">
          <h2 className="disTypography-root makeStyles-bodyText-24 disTypography-h5 disTypography-gutterBottom">
           {name} <span className="purple-text"></span>
          </h2>
          <p className="disTypography-root makeStyles-bodyText-24 disTypography-body2 disTypography-colorTextSecondary">
            Owner: {owner}
          </p>

          {priceInput}
          {button}

        </div>
      </div>
    </div>
  );
}

export default Item;
