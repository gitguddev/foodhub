import React, { useState, useRef } from "react";
import { Auth } from "../../utils/firebase";
import apiFetcher from "../../utils/apiFetcher";
import ManagerStyle from "./Manager.module.css";
import { useHistory } from "react-router-dom";

function RestaurantCreate() {
  const [restaurantName, restaurantNameUpdate] = useState("");
  const [description, descriptionUpdate] = useState("");
  const [error, errorSet] = useState("");
  const history = useHistory();
  const imageRef = useRef();

  function handleNameChange({ target }) {
    restaurantNameUpdate(target.value);
  }

  function handleDescriptionChange({ target }) {
    descriptionUpdate(target.value);
  }

  async function handleCreation(event) {
    event.preventDefault();

    const formData = new FormData();
    formData.append("image", imageRef.current.files[0]);

    const json = await apiFetcher({
      url: `/manager/restaurant/insert.php?name=${restaurantName}&user_uid=${Auth.currentUser.uid}&info=${description}`,
      option: { method: "POST", body: formData },
    });

    if (json.message === "success") {
      history.push("/manager/list");
    } else {
      errorSet(<center>พบปัญหาในการสร้างร้านค้า</center>);
    }
  }

  return (
    <div>
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
          <input
            ref={imageRef}
            type="file"
            required
            accept="image/*"
            name="image"
          />
          <span className={ManagerStyle.error}>{error}</span>
          <input type="submit" value="สร้างร้านอาหาร" />
        </form>
      </small>
    </div>
  );
}

export default RestaurantCreate;
