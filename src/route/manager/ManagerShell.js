import React, { Suspense, useState } from "react";
import ManagerStyle from "./Manager.module.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faBars,
  faTimesCircle,
  faSignOutAlt,
} from "@fortawesome/free-solid-svg-icons";
import { Auth } from "../../utils/firebase";
import { NavLink } from "react-router-dom";

function NavButton({ icon, title, to, exact }) {
  return (
    <NavLink
      className={ManagerStyle.navmenuButton}
      to={to}
      activeClassName={ManagerStyle.navmenuSelected}
      exact={exact}
    >
      <div>
        <FontAwesomeIcon icon={icon} /> {title}
      </div>
    </NavLink>
  );
}

function UserSection() {
  const { displayName, photoURL } = Auth.currentUser;

  return (
    <div className={ManagerStyle.userSection}>
      <img src={photoURL} />
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
      {menu}
      <div
        className={ManagerStyle.navmenuButton}
        onClick={() => Auth.signOut()}
      >
        <FontAwesomeIcon icon={faSignOutAlt} /> ออกจากระบบ
      </div>
    </div>
  );
}

export default ManagerShell;
export { NavButton };
