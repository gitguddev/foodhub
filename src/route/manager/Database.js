import React from "react";
import ManagerStyle from "./Manager.module.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faHamburger,
  faStore,
  faUserTie,
} from "@fortawesome/free-solid-svg-icons";
import { Link, useRouteMatch, Switch, Route } from "react-router-dom";
import { RestaurantManage, FoodManage, WorkerManage } from "./ManagerRoute";

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
      <Link to={`${match.url}/worker`}>
        <big className={ManagerStyle.title}>
          <FontAwesomeIcon icon={faUserTie} />
          พนักงาน
        </big>
        <br />
        <span className={ManagerStyle.description}>
          เพิ่ม ลบ และแก้ไขข้อมูลพนักงานภายในร้าน
        </span>
      </Link>
    </div>
  );
}

function Database() {
  const match = useRouteMatch();

  return (
    <Switch>
      <Route
        path={`${match.path}/restaurant/qrcode`}
        component={RestaurantManage}
      />
      <Route path={`${match.path}/restaurant`} component={RestaurantManage} />
      <Route path={`${match.path}/food`} component={FoodManage} />
      <Route path={`${match.path}/worker`} component={WorkerManage} />
      <Route path={`${match.path}`} component={Menu} />
    </Switch>
  );
}

export default Database;
