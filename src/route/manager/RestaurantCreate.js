import React, { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Auth } from "../../utils/firebase";
import ManagerStyle from "./Manager.module.css";
import { faStore } from "@fortawesome/free-solid-svg-icons";
import { useHistory } from "react-router-dom";

const API = "http://192.168.1.32/~littleboycoding/foodhub_api";

function RestaurantCreate() {
  const [restaurantName, restaurantNameUpdate] = useState("");
  const [description, descriptionUpdate] = useState("");
  const [error, errorSet] = useState("");
  const history = useHistory();

  function handleNameChange({ target }) {
    restaurantNameUpdate(target.value);
  }

  function handleDescriptionChange({ target }) {
    descriptionUpdate(target.value);
  }

  async function handleCreation(event) {
    event.preventDefault();

    const json = await fetch(
      `${API}/restaurant/insert.php?name=${restaurantName}&user_uid=${Auth.currentUser.uid}&info=${description}`
    );

    //if (json) {
    //restaurantNameUpdate("");
    //descriptionUpdate("");
    //} else {
    //errorSet("มีปัญหาในการสร้างร้านอาหาร");
    //}

    history.push("/manager/list");
  }

  return (
    <div style={{ padding: 10 }}>
      <big>
        <FontAwesomeIcon icon={faStore} /> สร้างร้านอาหาร
      </big>
      <small>
        <form className={ManagerStyle.form} onSubmit={handleCreation}>
          ชื่อร้านอาหาร
          <input
            type="text"
            placeholder="ชื่อร้านอาหาร"
            value={restaurantName}
            onChange={handleNameChange}
            required={true}
          />
          คำอธิบายร้านค้า
          <input
            type="text"
            placeholder="คำอธิบายร้านค้า"
            value={description}
            onChange={handleDescriptionChange}
            required={true}
          />
          <span className={ManagerStyle.error}>{error}</span>
          <input type="submit" value="สร้างร้านอาหาร" />
        </form>
      </small>
    </div>
  );
}

export default RestaurantCreate;
