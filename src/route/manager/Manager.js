import React, { useState, useEffect, createContext, useContext } from "react";
import ManagerStyle from "./Manager.module.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import checkBillSfx from "../../checkBill.mp3";
import deskBellSfx from "../../deskBell.mp3";
import {
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
  Report,
} from "./ManagerRoute";

import { createSocket } from "../../utils/socket.io";

import styled from "styled-components";

import { useAsync } from "react-async";

import { SERVER_ADDRESS, PROTOCOL } from "../../utils/config";

// import RestaurantSelector from "./RestaurantSelect";

const Socket = createContext();

function ManagerControlPanel({ user }) {
  const worker = useWorker();
  const match = useRouteMatch();
  const [modalData, setModalData] = useState();
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

  if (worker?.restaurant_id) {
    return (
      <Socket.Provider value={{ socket, connected }}>
        <Switch>
          <Route
            path={`${match.path}/restaurant/:restaurant_id`}
            component={RestaurantRoute}
          />
          <Redirect to={`${match.url}/restaurant/${worker.restaurant_id}`} />
        </Switch>
      </Socket.Provider>
    );
  }

  return !worker && connected && user ? (
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

function unlockAudio([firstAudio, secondAudio]) {
  firstAudio.play();
  firstAudio.pause();
  firstAudio.currentTime = 0;

  secondAudio.play();
  secondAudio.pause();
  secondAudio.currentTime = 0;

  document.body.removeEventListener("click", () =>
    unlockAudio([audio, deskBell])
  );
  document.body.removeEventListener("touchstart", () =>
    unlockAudio([audio, deskBell])
  );
}

document.body.addEventListener("click", () => unlockAudio([audio, deskBell]));
document.body.addEventListener("touchstart", () =>
  unlockAudio([audio, deskBell])
);

function FoodAlertLabel() {
  const { restaurant_id } = useParams();
  const { socket } = useContext(Socket);
  const { data, error, reload } = useAsync({
    promiseFn: apiFetcher,
    url: `/manager/order/select.php?restaurant_id=${restaurant_id}&user_uid=${Auth.currentUser.uid}`,
  });

  const length =
    data?.result?.filter((filter) => parseInt(filter.status) < 2).length || 0;

  function ReFetcher() {
    function Reloader(play) {
      if (play) {
        deskBell.play();
      }
      reload();
    }

    socket.on("updateNavbar", Reloader);
    socket.on("cancelNavbar", Reloader);
    socket.on("orderNavbar", () => Reloader(true));
    return () => {
      socket.off("updateNavbar");
      socket.off("cancelNavbar");
      socket.off("orderNavbar");
    };
  }

  //CHEAP WAY TO DETECT NEW SESSION, WILL SURELY BE REWORK SOON
  useEffect(ReFetcher, [restaurant_id, socket, reload]);

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
  const worker = useWorker();
  const role = worker?.role;

  useEffect(() => {
    socket.emit("join", restaurant_id);
    return () => {
      socket.emit("leave", restaurant_id);
    };
  }, [match, restaurant_id, socket]);

  if (worker === "loading") return <Loader />;

  return (
    <>
      <ManagerShell
        title={
          <Switch>
            <Route path={`${match.path}/database`}>จัดการข้อมูล</Route>
            <Route path={`${match.path}/session`}>เซสชั่น</Route>
            <Route path={`${match.path}/report`}>รายงาน</Route>
            <Route path={`${match.path}/queue`}>คิวการสั่งอาหาร</Route>
            {/* <Route path={match.path}>หน้าแรก</Route> */}
          </Switch>
        }
        content={
          <Switch>
            {(!worker || role === 2) && (
              <Route path={`${match.path}/database`} component={Database} />
            )}
            {(!worker || role === 2 || role === 0) && (
              <Route path={`${match.path}/session`} component={Session} />
            )}
            {(!worker || role === 2) && (
              <Route path={`${match.path}/report`} component={Report} />
            )}
            {(!worker || role === 2 || role === 1) && (
              <Route path={`${match.path}/queue`} component={OrderQueue} />
            )}
            {!worker && <Redirect to={`${match.path}/report`} />}
            {role === 0 && <Redirect to={`${match.path}/session`} />}
            {role === 1 && <Redirect to={`${match.path}/queue`} />}
            {role === 2 && <Redirect to={`${match.path}/database`} />}
          </Switch>
        }
        panel={
          <>
            {/* <NavButton icon={faHome} to={match.url} exact title="หน้าแรก" /> */}
            {(!worker || role === 2) && (
              <NavButton
                icon={faDatabase}
                to={`${match.url}/database`}
                title="จัดการข้อมูล"
              />
            )}
            {(!worker || role === 0 || role === 2) && (
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
            )}
            {(!worker || role === 1 || role === 2) && (
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
            )}
            {(!worker || role === 2) && (
              <NavButton
                icon={faFileAlt}
                to={`${match.url}/report`}
                title="รายงาน"
              />
            )}
            {!worker && (
              <NavButton
                icon={faStore}
                to={`/manager/list`}
                title="เลือกร้านอาหาร"
              />
            )}
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

function PrivateRoute({ children: Component, ...rest }) {
  const worker = useWorker();

  if (worker)
    return (
      <Route {...rest}>
        <ManagerControlPanel user={{ uid: "worker" }} />
      </Route>
    );
  return (
    <Route
      {...rest}
      render={() =>
        Auth.currentUser ? Component : <Redirect to={`/manager/sign-in`} />
      }
    ></Route>
  );
}

function WorkerOut() {
  window.localStorage.removeItem("jwt");

  window.location.href = PROTOCOL + "://" + SERVER_ADDRESS + "/manager";
}

function WorkerAuth() {
  const { jwt } = useParams();
  const storage = window.localStorage;
  storage.setItem("jwt", jwt);

  window.location.href = PROTOCOL + "://" + SERVER_ADDRESS + "/manager";
}

function useWorker() {
  const { data, error } = useAsync({
    promiseFn: apiFetcher,
    url: `/manager/worker/check.php`,
    option: {
      headers: {
        Accept: "application/json",
        Authorization: "Bearer " + window.localStorage.getItem("jwt"),
      },
    },
  });

  if (!window.localStorage.getItem("jwt")) return null;
  if (error) return error.message;
  if (data?.message) {
    switch (data.message) {
      case "success":
        return { ...data.result, role: parseInt(data.result.role) };
      default:
        window.localStorage.removeItem("jwt");
        return data.message;
    }
  }
  return "loading";
}

function Manager() {
  const [isSignedIn, setSignState] = useState(null);
  const match = useRouteMatch();

  useEffect(() => {
    if (!window.localStorage.getItem("jwt"))
      return Auth.onAuthStateChanged((user) => setSignState(user));
  });

  return (
    <Switch>
      <Route path={`${match.path}/workerauth/:jwt`} component={WorkerAuth} />
      <Route path={`${match.path}/workerout`} component={WorkerOut} />
      <Route
        path={`${match.path}/sign-in`}
        render={() =>
          !isSignedIn && !window.localStorage.getItem("jwt") ? (
            <SignInForm />
          ) : (
            <Redirect to={`/manager`} />
          )
        }
      />
      <PrivateRoute path={`${match.path}`}>
        <ManagerControlPanel user={isSignedIn} />
      </PrivateRoute>
    </Switch>
  );
}
export default Manager;
export { Socket, useWorker };
