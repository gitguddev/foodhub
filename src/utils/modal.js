import React from "react";
import ModalStyle from "./modal.module.css";

function Modal({ children, modalData, onCloseEmit }) {
  return (
    <div
      style={{ display: children || modalData ? "flex" : "none" }}
      className={ModalStyle.modalContainer}
    >
      <div className={ModalStyle.modalBackground} onClick={onCloseEmit}></div>
      <div className={ModalStyle.modal}>{children ? children : modalData}</div>
    </div>
  );
}

export default Modal;
