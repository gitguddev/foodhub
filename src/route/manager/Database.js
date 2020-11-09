import React, { useState } from "react";
import ManagerStyle from "./Manager.module.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faHamburger, faStore } from "@fortawesome/free-solid-svg-icons";
import {
  Link,
  useRouteMatch,
  Switch,
  Route,
  useParams,
} from "react-router-dom";
import apiFetcher from "../../utils/apiFetcher";
import { Auth } from "../../utils/firebase";

function Restaurant() {
  const [restaurantName, restaurantNameUpdate] = useState("");
  const param = useParams();
  const [status, setStatus] = useState();
  const [description, descriptionUpdate] = useState("");
  const [tableQuantity, tableQuantityUpdate] = useState(0);

  function handleTableQuantityChange({ target }) {
    tableQuantityUpdate(target.value);
  }

  function handleNameChange({ target }) {
    restaurantNameUpdate(target.value);
  }

  function handleDescriptionChange({ target }) {
    descriptionUpdate(target.value);
  }

  async function handleUpdate(event) {
    event.preventDefault();

    const json = await apiFetcher({
      url: `/manager/restaurant/update.php?id=${param.restaurant_id}&name=${restaurantName}&info=${description}&table_quantity=${tableQuantity}&user_uid=${Auth.currentUser.uid}`,
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

  return (
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
      <span className={ManagerStyle.status}>{status}</span>
      <input type="submit" value="แก้ไขข้อมูล" />
    </form>
  );
}
function Table() {
  return <span>โต๊ะอาหาร</span>;
}
function Food() {
  return <span>อาหาร</span>;
}

function Menu() {
  const match = useRouteMatch();

  return (
    <div className={ManagerStyle.database}>
      <Link to={`${match.url}/restaurant`}>
        <big className={ManagerStyle.title}>
          <FontAwesomeIcon icon={faStore} />
          ข้อมูลร้านค้า
        </big>
        <br />
        <span className={ManagerStyle.description}>
          แก้ไขข้อมูลร้านค้า เช่น ชื่อร้าน รายละเอียดและอื่น ๆ
        </span>
      </Link>
      <Link to={`${match.url}/food`}>
        <big className={ManagerStyle.title}>
          <FontAwesomeIcon icon={faHamburger} />
          อาหาร
        </big>
        <br />
        <span className={ManagerStyle.description}>
          เพิ่ม ลบ และแก้ไขข้อมูลอาหารภายในร้าน
        </span>
      </Link>
      {/*<Link to={`${match.url}/table`}>
        <big className={ManagerStyle.title}>
          <FontAwesomeIcon icon={faChair} />
          โต๊ะร้านอาหาร
        </big>
        <br />
        <span className={ManagerStyle.description}>
          เพิ่ม ลบ เรียงลำดับโต๊ะภายในร้าน
        </span>
      </Link>*/}
    </div>
  );
}

function Database() {
  const match = useRouteMatch();

  return (
    <div style={{ padding: 10 }}>
      <Switch>
        <Route path={`${match.path}/restaurant`} component={Restaurant} />
        <Route path={`${match.path}/food`} component={Food} />
        <Route path={`${match.path}/table`} component={Table} />
        <Route path={`${match.path}`} component={Menu} />
      </Switch>
    </div>
  );
}

export default Database;
