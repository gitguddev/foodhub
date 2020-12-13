import React, { Suspense, useState } from "react";
import ManagerStyle from "./Manager.module.css";
import Avatar from "../../Avatar.png";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faBars,
  faTimesCircle,
  faSignOutAlt,
} from "@fortawesome/free-solid-svg-icons";
import { Auth } from "../../utils/firebase";
import { NavLink, useHistory } from "react-router-dom";
import { useWorker } from "./Manager";

function NavButton({ icon, title, to, exact, onClick }) {
  return (
    <NavLink
      className={ManagerStyle.navmenuButton}
      to={to}
      activeClassName={ManagerStyle.navmenuSelected}
      exact={exact}
      onClick={onClick}
    >
      <div>
        <FontAwesomeIcon icon={icon} /> {title}
      </div>
    </NavLink>
  );
}

function UserSection() {
  const worker = useWorker();
  let displayName, photoURL;

  if (!window.localStorage.getItem("jwt")) {
    let currentUser = Auth.currentUser;
    displayName = currentUser?.displayName || "ผู้ใช้งาน";
    photoURL = currentUser?.photoURL ? currentUser?.photoURL : Avatar;
  } else {
    displayName = worker.name || "ผู้ใช้งาน";
    photoURL = worker.img || Avatar;
  }

  return (
    <div className={ManagerStyle.userSection}>
      <img src={photoURL} alt="user" />
      {displayName}
    </div>
  );
}

function ManagerShell({ rightTitle, title, content, panel }) {
  const [show, setShow] = useState(
    document.documentElement.clientWidth < 800 ? null : true
  );

  function togglePanel() {
    setShow(true);
  }

  return (
    <>
      {show != null && <Panel setShow={setShow} show={show} menu={panel} />}
      <div className={ManagerStyle.container}>
        <div className={ManagerStyle.navbar}>
          <div>
            <FontAwesomeIcon icon={faBars} onClick={togglePanel} /> {title}
          </div>
          {rightTitle}
        </div>
        <div className={ManagerStyle.content}>
          <Suspense fallback="กำลังโหลด">{content}</Suspense>
        </div>
      </div>
    </>
  );
}

function Panel({ setShow, show, menu }) {
  const history = useHistory();

  function togglePanel() {
    setShow(false);
  }

  function WorkerSignOut() {
    window.localStorage.removeItem("jwt");
    history.push("/");
    window.location.reload();
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
      {menu}
      <div
        className={ManagerStyle.navmenuButton}
        onClick={
          window.localStorage.getItem("jwt")
            ? WorkerSignOut
            : () => Auth.signOut()
        }
      >
        <FontAwesomeIcon icon={faSignOutAlt} /> ออกจากระบบ
      </div>
    </div>
  );
}

export default ManagerShell;
export { NavButton };
