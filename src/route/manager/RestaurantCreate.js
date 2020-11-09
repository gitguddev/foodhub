import React, { useState } from "react";
import { Auth } from "../../utils/firebase";
import apiFetcher from "../../utils/apiFetcher";
import ManagerStyle from "./Manager.module.css";
import { useHistory } from "react-router-dom";

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

    const json = await apiFetcher(
      `/restaurant/insert.php?name=${restaurantName}&user_uid=${Auth.currentUser.uid}&info=${description}`
    );

    if (json.message === "success") {
      history.push("/manager/list");
    } else {
      errorSet(<center>พบปัญหาในการสร้างร้านค้า</center>);
    }
  }

  return (
    <div style={{ padding: 10 }}>
      <big>
        <b>สร้างร้านอาหาร</b>
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
          <textarea
            type="text"
            placeholder="คำอธิบายร้านค้า"
            value={description}
            onChange={handleDescriptionChange}
            required={true}
            rows={4}
            maxLength={150}
          />
          <span className={ManagerStyle.error}>{error}</span>
          <input type="submit" value="สร้างร้านอาหาร" />
        </form>
      </small>
    </div>
  );
}

export default RestaurantCreate;
