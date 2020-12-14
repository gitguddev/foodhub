import React, { useRef, useState } from "react";
import apiFetcher from "../../utils/apiFetcher";
import { useParams, useHistory } from "react-router-dom";
import { useAsync } from "react-async";
import ManagerStyle from "./Manager.module.css";
import { Auth } from "../../utils/firebase";
import QRCode from "qrcode";
import { PDFDocument, rgb } from "pdf-lib";
import fontkit from "@pdf-lib/fontkit";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faQrcode } from "@fortawesome/free-solid-svg-icons";
import { PROTOCOL, SERVER_ADDRESS } from "../../utils/config";

async function QRCodePrint(restaurant_id, table_quantity) {
  const pdf = await PDFDocument.create();
  pdf.registerFontkit(fontkit);

  const [kanitFont, background] = await Promise.all([
    import("../../fonts/Kanit-Regular.ttf").then(async ({ default: font }) =>
      pdf.embedFont(await fetch(font).then((res) => res.arrayBuffer()))
    ),
    import("../../background.jpg").then(async ({ default: image }) =>
      pdf.embedJpg(await fetch(image).then((res) => res.arrayBuffer()))
    ),
  ]);

  function downloadBlob(data, fileName, mimeType) {
    let blob = new Blob([data], {
      type: mimeType,
    });
    let url = window.URL.createObjectURL(blob);
    downloadURL(url, fileName);
    setTimeout(() => window.URL.revokeObjectURL(url), 1000);
  }

  function downloadURL(data, fileName) {
    const a = document.createElement("a");
    a.href = data;
    a.target = "_blank";
    a.click();
    a.remove();
  }

  for (let i = 1; i <= table_quantity; i++) {
    const currentPage = pdf.addPage();
    const { height, width } = currentPage.getSize();
    const url = await QRCode.toDataURL(
      `${PROTOCOL}://${SERVER_ADDRESS}/restaurant/auth/${restaurant_id}/${i}`,
      {
        width: width / 2,
      }
    );

    const info = "โต๊ะที่" + i;
    const infoSize = 50;
    const infoWidth = kanitFont.widthOfTextAtSize(info, infoSize);

    currentPage.drawImage(background, {
      x: 0,
      y: 0,
      width,
      height,
    });

    currentPage.drawText(info, {
      x: width / 2 - infoWidth / 2 - 10,
      y: 45,
      size: infoSize,
      font: kanitFont,
      color: rgb(1, 1, 1),
    });

    currentPage.moveTo(width / 2, height / 2);

    const image = await pdf.embedPng(url);
    const imageDim = image;

    currentPage.drawImage(image, {
      x: width / 2 - imageDim.width / 2,
      y: height / 2 - imageDim.height / 2,
      width: imageDim.width,
      height: imageDim.height,
    });
  }

  pdf
    .save()
    .then((savedPDF) =>
      downloadBlob(savedPDF, "qrcode.pdf", "application/pdf")
    );
}

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
    if (imageRef.current.files?.length > 0)
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
            />{" "}
            <button
              type="button"
              onClick={() => QRCodePrint(param.restaurant_id, tableQuantity)}
            >
              <FontAwesomeIcon icon={faQrcode} /> ปริ้น QR Code
            </button>
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
