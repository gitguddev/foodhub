import React, { useState, useEffect } from "react";
import ManagerStyle from "./Manager.module.css";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faBars,
  faTimesCircle,
  faHome,
  faDatabase,
  faFileAlt,
  faUtensils,
  faSignOutAlt,
} from "@fortawesome/free-solid-svg-icons";

import Icon from "../icon.png";

//Firebase configuration
import firebase from "firebase/app";
import "firebase/auth";
window.firebase = firebase;

const firebaseConfig = {
  apiKey: "AIzaSyC4Mni8wooOc8UXo_SUazQQi_02Z-YzBPI",
  authDomain: "foodhub-294508.firebaseapp.com",
};

firebase.initializeApp(firebaseConfig);

const Auth = firebase.auth();
const AuthUIConfig = {
  signInOptions: [
    firebase.auth.EmailAuthProvider.PROVIDER_ID,
    firebase.auth.FacebookAuthProvider.PROVIDER_ID,
    firebase.auth.TwitterAuthProvider.PROVIDER_ID,
    firebase.auth.GithubAuthProvider.PROVIDER_ID,
  ],
};
const AuthUI = new window.firebaseui.auth.AuthUI(Auth);

function Panel({ setShow, show }) {
  function togglePanel() {
    setShow(false);
  }

  return (
    <div
      className={`${ManagerStyle.navmenu} ${
        show ? ManagerStyle.slideIn : ManagerStyle.slideOut
      }`}
    >
      <div onClick={togglePanel} className={ManagerStyle.navmenuClose}>
        <FontAwesomeIcon icon={faTimesCircle} /> ปิด
      </div>
      <UserSection />
      <NavbarMenuButton icon={faHome} title="หน้าแรก" selected />
      <NavbarMenuButton icon={faDatabase} title="ข้อมูลร้านค้า" />
      <NavbarMenuButton icon={faUtensils} title="คิวอาหาร" />
      <NavbarMenuButton icon={faFileAlt} title="รายงาน" />
      <NavbarMenuButton
        icon={faSignOutAlt}
        onClick={() => Auth.signOut()}
        title="ออกจากระบบ"
      />
    </div>
  );
}

function UserSection() {
  const { displayName, photoURL } = Auth.currentUser;
  console.log(Auth.currentUser);

  return (
    <div className={ManagerStyle.UserSection}>
      <img src={photoURL} />
      {displayName}
    </div>
  );
}

function NavbarMenuButton({ icon, title, selected, onClick }) {
  return (
    <div onClick={onClick} className={selected && ManagerStyle.navmenuSelected}>
      <FontAwesomeIcon icon={icon} /> {title}
    </div>
  );
}

function ManagerContainer() {
  const [show, setShow] = useState(null);

  function togglePanel() {
    setShow(true);
  }

  return (
    <>
      {show != null && <Panel setShow={setShow} show={show} />}
      <div className={ManagerStyle.navbar}>
        <FontAwesomeIcon icon={faBars} onClick={togglePanel} />
        หน้าหลัก
      </div>
    </>
  );
}

function SignInForm() {
  useEffect(() => {
    AuthUI.start("#signInForm", AuthUIConfig);
  });

  return (
    <div>
      <div className={ManagerStyle.FormHeader}>
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

function Manager() {
  const [currentUser, updateUser] = useState(null);

  useEffect(() => Auth.onAuthStateChanged((user) => updateUser(user)));

  return currentUser ? <ManagerContainer /> : <SignInForm />;
}

export default Manager;
