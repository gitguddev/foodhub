import React, { useState, useEffect, createContext, useContext } from "react";
import ManagerStyle from "./Manager.module.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import checkBillSfx from "../../checkBill.mp3";
import deskBellSfx from "../../deskBell.mp3";
import {
  faHome,
  faDatabase,
  faFileAlt,
  faUtensils,
  faPlus,
  faStore,
  faChair,
} from "@fortawesome/free-solid-svg-icons";
import {
  Switch,
  Route,
  useRouteMatch,
  Redirect,
  Link,
  useParams,
} from "react-router-dom";
import Icon from "./icon.png";
import ManagerShell, { NavButton } from "./ManagerShell";
import apiFetcher from "../../utils/apiFetcher";

//Utils
import { AuthUI, Auth, AuthUIConfig } from "../../utils/firebase";
import Modal from "../../utils/modal";
import Loader from "../../utils/Loader";

//Restaurant Select and Create
import {
  RestaurantCreate,
  RestaurantSelect,
  Database,
  OrderQueue,
  Session,
} from "./ManagerRoute";

import { createSocket } from "../../utils/socket.io";

import styled from "styled-components";

import { useAsync } from "react-async";

// import RestaurantSelector from "./RestaurantSelect";

const Socket = createContext();

function ManagerControlPanel({ user }) {
  const [modalData, setModalData] = useState();
  const match = useRouteMatch();
  const [connected, connectedSet] = useState(false);
  const [socket, socketSet] = useState();

  function socketCreation() {
    const socket = createSocket(user);
    socketSet(socket);
    socket.on("connect", () => connectedSet(true));
    socket.on("disconnect", () => connectedSet(false));
    socket.on("connect_error", () => connectedSet(false));
    return () => {
      socket.disconnect();
      socket.off("connect");
      socket.off("disconnect");
      socket.off("connect_error");
    };
  }

  useEffect(socketCreation, [user]);

  return connected ? (
    <Socket.Provider value={{ socket, connected }}>
      <Modal modalData={modalData} onCloseEmit={() => setModalData()}></Modal>
      <Switch>
        <Route path={`${match.path}/list`} component={ListRoute} />
        <Route
          path={`${match.path}/restaurant/:restaurant_id`}
          component={RestaurantRoute}
        />
        <Redirect to={`${match.url}/list`} />
      </Switch>
    </Socket.Provider>
  ) : (
    <Loader />
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

const AlertLabelStyled = styled.div`
  padding: 0 10px;
  color: white;
  background-color: ${(props) => (props.alert ? "red" : "blue")};
  display: inline-block;
  border-radius: 3px;
  margin-left: 10px;
`;

const audio = new Audio(checkBillSfx);
const deskBell = new Audio(deskBellSfx);

function FoodAlertLabel() {
  const { restaurant_id } = useParams();
  const { socket } = useContext(Socket);
  const { data, error, reload, cancel, isPending } = useAsync({
    promiseFn: apiFetcher,
    url: `/manager/order/select.php?restaurant_id=${restaurant_id}&user_uid=${Auth.currentUser.uid}`,
  });

  const length =
    data?.result?.filter((filter) => parseInt(filter.status) < 2).length || 0;

  function ReFetcher() {
    socket.on("update", () => {
      if (isPending) cancel();
      reload();
    });
    socket.on("cancel", () => {
      if (isPending) cancel();
      reload();
    });
    socket.on("order", () => {
      deskBell.play();
      if (isPending) cancel();
      reload();
    });
    return () => {
      socket.off("order");
      socket.off("update");
      socket.off("cancel");
      cancel();
    };
  }

  //CHEAP WAY TO DETECT NEW SESSION, WILL SURELY BE REWORK SOON
  useEffect(ReFetcher, [restaurant_id, cancel, reload, length]);

  if (error) return error;
  if (data?.message === "success") {
    return <AlertLabelStyled alert={length > 0}>{length}</AlertLabelStyled>;
  }
  return <AlertLabelStyled>0</AlertLabelStyled>;
}

function AlertLabel() {
  const { restaurant_id } = useParams();
  const { socket } = useContext(Socket);
  const { data, error, reload, cancel, isPending } = useAsync({
    promiseFn: apiFetcher,
    url: `/manager/session/get.php?restaurant_id=${restaurant_id}&user_uid=${Auth.currentUser.uid}`,
  });

  const length = data?.result?.length || 0;
  const alert =
    data?.result?.filter((filter) => parseInt(filter.status) === 1).length > 0;

  function ReFetcher() {
    const timer = setInterval(() => reload(), 1000);
    socket.on("checkBill", () => {
      audio.play();
      if (isPending) cancel();
      reload();
    });
    return () => {
      socket.off("checkBill");
      cancel();
      clearInterval(timer);
    };
  }

  //CHEAP WAY TO DETECT NEW SESSION, WILL SURELY BE REWORK SOON
  useEffect(ReFetcher, [restaurant_id, cancel, reload, length]);

  if (error) return error;
  if (data?.message === "success") {
    return <AlertLabelStyled alert={alert}>{length}</AlertLabelStyled>;
  }
  return <AlertLabelStyled>0</AlertLabelStyled>;
}

function RestaurantRoute() {
  const match = useRouteMatch();
  const { restaurant_id } = useParams();
  const { socket } = useContext(Socket);

  useEffect(() => {
    socket.emit("join", restaurant_id);
    return () => {
      socket.emit("leave", restaurant_id);
    };
  }, [restaurant_id, socket]);

  return (
    <>
      <ManagerShell
        title={
          <Switch>
            <Route path={`${match.path}/database`}>จัดการข้อมูล</Route>
            <Route path={`${match.path}/session`}>เซสชั่น</Route>
            <Route path={`${match.path}/report`}>รายงาน</Route>
            <Route path={`${match.path}/queue`}>คิวการสั่งอาหาร</Route>
            <Route path={match.path}>หน้าแรก</Route>
          </Switch>
        }
        content={
          <Switch>
            <Route path={`${match.path}/database`} component={Database} />
            <Route path={`${match.path}/session`} component={Session} />
            <Route path={`${match.path}/report`} component={() => "รายงาน"} />
            <Route path={`${match.path}/queue`} component={OrderQueue} />
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
              icon={faChair}
              to={`${match.url}/session`}
              title={
                <>
                  <span>เซสชั่น</span>
                  <AlertLabel />
                </>
              }
            />
            <NavButton
              icon={faUtensils}
              to={`${match.url}/queue`}
              title={
                <>
                  <span>คิวการสั่งอาหาร</span>
                  <FoodAlertLabel />
                </>
              }
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
    </>
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
          alt="FoodHub icon"
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

  useEffect(() => Auth.onAuthStateChanged((user) => setSignState(user)));

  if (isSignedIn) {
    return (
      <Switch>
        <Route
          path={`${match.path}/sign-in`}
          render={() =>
            !isSignedIn ? <SignInForm /> : <Redirect to={`/manager`} />
          }
        />
        <PrivateRoute path={`${match.path}`}>
          <ManagerControlPanel user={isSignedIn} />
        </PrivateRoute>
      </Switch>
    );
  } else {
    return "Loading";
  }
}
export default Manager;
export { Socket };
