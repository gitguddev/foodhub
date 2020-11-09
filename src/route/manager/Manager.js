import React, { useState, useEffect } from "react";
import ManagerStyle from "./Manager.module.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faHome,
  faDatabase,
  faFileAlt,
  faUtensils,
  faPlus,
  faStore,
} from "@fortawesome/free-solid-svg-icons";
import { Switch, Route, useRouteMatch, Redirect, Link } from "react-router-dom";
import Icon from "./icon.png";
import ManagerShell, { NavButton } from "./ManagerShell";

//Utils
import { AuthUI, Auth, AuthUIConfig } from "../../utils/firebase";
import Modal from "../../utils/modal";

//Restaurant Select and Create
import { RestaurantCreate, RestaurantSelect, Database } from "./ManagerRoute";

function ManagerControlPanel() {
  const [modalData, setModalData] = useState();
  const match = useRouteMatch();

  return (
    <>
      <Modal modalData={modalData} onCloseEmit={() => setModalData()}></Modal>
      <Switch>
        <Route path={`${match.path}/list`} component={ListRoute} />
        <Route
          path={`${match.path}/restaurant/:restaurant_id`}
          component={RestaurantRoute}
        />
        <Redirect to={`${match.url}/list`} />
      </Switch>
    </>
  );
}

function ListRoute() {
  const match = useRouteMatch();

  return (
    <ManagerShell
      title={
        <Switch>
          <Route path={`${match.path}/create`}>สร้างร้านอาหาร</Route>
          <Route path={match.path}>เลือกร้านอาหาร</Route>
        </Switch>
      }
      rightTitle={
        <Switch>
          <Route exact path={match.path}>
            <Link to={`${match.url}/create`}>
              <FontAwesomeIcon icon={faPlus} />
            </Link>
          </Route>
        </Switch>
      }
      content={
        <Switch>
          <Route path={`${match.path}/create`} component={RestaurantCreate} />
          <Route path={match.path} component={RestaurantSelect} />
        </Switch>
      }
      panel={
        <>
          <NavButton
            exact
            icon={faStore}
            to={match.url}
            title="เลือกร้านอาหาร"
          />
          <NavButton
            icon={faPlus}
            to={`${match.url}/create`}
            title="สร้างร้านอาหาร"
          />
        </>
      }
    />
  );
}

function RestaurantRoute() {
  const match = useRouteMatch();

  return (
    <ManagerShell
      title={
        <Switch>
          <Route path={`${match.path}/database`}>จัดการข้อมูล</Route>
          <Route path={`${match.path}/report`}>รายงาน</Route>
          <Route path={`${match.path}/queue`}>คิวการสั่งอาหาร</Route>
          <Route path={match.path}>หน้าแรก</Route>
        </Switch>
      }
      content={
        <Switch>
          <Route path={`${match.path}/database`} component={Database} />
          <Route path={`${match.path}/report`} component={() => "รายงาน"} />
          <Route
            path={`${match.path}/queue`}
            component={() => "คิวการสั่งอาหาร"}
          />
          <Route path={match.path} component={() => "หน้าแรก"} />
        </Switch>
      }
      panel={
        <>
          <NavButton icon={faHome} to={match.url} exact title="หน้าแรก" />
          <NavButton
            icon={faDatabase}
            to={`${match.url}/database`}
            title="จัดการข้อมูล"
          />
          <NavButton
            icon={faUtensils}
            to={`${match.url}/queue`}
            title="คิวการสั่งอาหาร"
          />
          <NavButton
            icon={faFileAlt}
            to={`${match.url}/report`}
            title="รายงาน"
          />
          <NavButton
            icon={faStore}
            to={`/manager/list`}
            title="เลือกร้านอาหาร"
          />
        </>
      }
    />
  );
}

function SignInForm() {
  useEffect(() => {
    AuthUI.start("#signInForm", AuthUIConfig);
  });

  return (
    <div>
      <div className={ManagerStyle.formHeader}>
        <img
          style={{
            objectFit: "cover",
          }}
          src={Icon}
          width="120px"
          height="120px"
        />
        <br />
        <big>เข้าสู่ระบบ FoodHub</big>
        <br />
        <span style={{ color: "#858585" }}>
          เลือกช่องทางการเข้าสู่ระบบด้านล่าง
        </span>
      </div>
      <div id="signInForm"></div>
    </div>
  );
}

function PrivateRoute({ component: Component, ...rest }) {
  return (
    <Route
      {...rest}
      render={() =>
        Auth.currentUser ? <Component /> : <Redirect to={`/manager/sign-in`} />
      }
    />
  );
}

function Manager() {
  const [isSignedIn, setSignState] = useState(null);
  const match = useRouteMatch();

  useEffect(() =>
    Auth.onAuthStateChanged((user) =>
      setSignState(user === null ? false : true)
    )
  );

  if (isSignedIn !== null) {
    return (
      <Switch>
        <Route
          path={`${match.path}/sign-in`}
          render={() =>
            !isSignedIn ? <SignInForm /> : <Redirect to={`/manager`} />
          }
        />
        <PrivateRoute path={`${match.path}`} component={ManagerControlPanel} />
      </Switch>
    );
  } else {
    return "Loading";
  }
}
export default Manager;
