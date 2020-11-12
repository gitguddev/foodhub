import React, { useRef, useState } from "react";
import apiFetcher from "../../utils/apiFetcher";
import { useParams, useHistory } from "react-router-dom";
import { useAsync } from "react-async";
import ManagerStyle from "./Manager.module.css";
import { Auth } from "../../utils/firebase";

function RestaurantManage() {
  const param = useParams();
  const history = useHistory();

  const imageRef = useRef();
  const coverRef = useRef();

  const [restaurantName, restaurantNameUpdate] = useState("");
  const [description, descriptionUpdate] = useState("");
  const [tableQuantity, tableQuantityUpdate] = useState(0);
  const [imageSrc, imageSrcUpdate] = useState("");
  const [status, setStatus] = useState();

  const { error, data } = useAsync({
    promiseFn: apiFetcher,
    url: `/manager/restaurant/get.php?id=${param.restaurant_id}&user_uid=${Auth.currentUser.uid}`,
    onResolve({ result }) {
      restaurantNameUpdate(result.name);
      descriptionUpdate(result.info);
      tableQuantityUpdate(result.table_quantity);
      imageSrcUpdate(result.img);
    },
  });

  function handleTableQuantityChange({ target }) {
    tableQuantityUpdate(target.value);
  }

  function handleNameChange({ target }) {
    restaurantNameUpdate(target.value);
  }

  function handleDescriptionChange({ target }) {
    descriptionUpdate(target.value);
  }

  function handleImageChange({ target }) {
    const reader = new FileReader();
    reader.onload = ({ target }) => {
      coverRef.current.src = target.result;
    };

    reader.readAsDataURL(target.files[0]);
  }

  async function handleDelete() {
    const name = prompt("ยืนยันการลบร้านอาหาร กรุณาพิมพ์ชื่อร้านอาหาร");
    if (name !== null) {
      if (name === restaurantName) {
        const json = await apiFetcher({
          url: `/manager/restaurant/delete.php?id=${param.restaurant_id}&user_uid=${Auth.currentUser.uid}`,
        });
        if (json.message === "success") {
          history.push("/manager/list");
        } else {
          setStatus(
            <span className={ManagerStyle.error}>มีปัญหาในการลบร้านอาหาร</span>
          );
        }
      } else {
        handleDelete();
      }
    }
  }

  async function handleUpdate(event) {
    event.preventDefault();

    const formData = new FormData();
    formData.append("image", imageRef.current.files[0]);

    const json = await apiFetcher({
      url: `/manager/restaurant/update.php?id=${param.restaurant_id}&name=${restaurantName}&info=${description}&table_quantity=${tableQuantity}&user_uid=${Auth.currentUser.uid}`,
      option: {
        method: "POST",
        body: formData,
      },
    });

    if (json.message === "success") {
      setStatus(
        <span className={ManagerStyle.success}>แก้ไขข้อมูลสำเร็จ</span>
      );
    } else {
      setStatus(
        <span className={ManagerStyle.error}>เกิดปัญหาในการแก้ไขข้อมูล</span>
      );
    }
  }

  if (error) return error;
  if (data?.message === "success")
    return (
      <div>
        <big>
          <b>จัดการข้อมูล</b>
        </big>
        <form className={ManagerStyle.form} onSubmit={handleUpdate}>
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
          <label>
            จำนวนโต๊ะภายในร้าน{" "}
            <input
              type="number"
              min={0}
              max={99}
              value={tableQuantity}
              onChange={handleTableQuantityChange}
            />
          </label>
          รูปร้านอาหาร
          <img
            ref={coverRef}
            src={imageSrc}
            alt="รูปภาพร้านอาหาร"
            style={{
              height: 200,
              objectFit: "cover",
              border: "1px solid #232323",
              marginBottom: 10,
            }}
          />
          <input
            type="file"
            onChange={handleImageChange}
            ref={imageRef}
            accept="image/*"
          />
          <span className={ManagerStyle.status}>{status}</span>
          <input type="submit" value="แก้ไขข้อมูล" />
          <input
            onClick={handleDelete}
            className={ManagerStyle.danger}
            type="button"
            value="ลบร้านอาหาร"
          />
        </form>
      </div>
    );
  return "Loading";
}

export default RestaurantManage;
