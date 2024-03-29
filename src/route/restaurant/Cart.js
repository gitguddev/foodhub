import React, { useState, useContext, useEffect } from "react";
import { useAuthAPI } from "../../utils/apiFetcher";
import Loader from "../../utils/Loader";
import styled from "styled-components";
import numeral from "numeral";
import { useRouteMatch, Switch, Route, useHistory } from "react-router-dom";
import { Socket } from "./Restaurant";
import { default as BillLoader } from "react-loader-spinner";

const CartContainer = styled.div`
  padding: 10px;
  display: flex;
  flex-direction: column;
  position: relative;
  height: calc(100% - 46px);
  overflow: auto;
`;

const StatusLabel = styled.span`
  font-size: 1.4em;
  margin-bottom: 10px;
`;

const TotalBar = styled.div`
  position: fixed;
  bottom: 75px;
  left: 0;
  width: 100%;
  padding: 10px;
  color: white;
  background-color: #454545;
  display: flex;
  justify-content: space-between;
`;

const FoodBlock = styled.div`
  display: flex;
  font-size: 0.7em;
  grid-gap: 8px;
  margin-bottom: 10px;

  & > div {
    display: flex;
    flex-direction: column;
  }

  .title {
    font-size: 1.1em;
  }
  .price,
  .quantity,
  .status {
    font-size: calc(1.5vh + 0.3vw + 3px);
  }

  img {
    width: 150px;
    max-width: 40vw;
    height: 130px;
    object-fit: cover;
  }

  @media only screen and (min-width: 1024px) {
    img {
      height: 180px;
      width: 210px;
    }
  }
`;

const Danger = styled.span`
  color: red;
  text-decoration: underline;
`;

const NoneText = styled.span`
  font-size: 0.7em;
`;

const Billed = styled.button`
  background-color: ${(props) => (props.disabled ? "grey" : "green")};
  color: white;
  padding: 4px 7px;
  font-size: 0.8em;
  border: none;
  border-radius: 3px;
  align-items: center;

  ${({ disabled }) =>
    !disabled &&
    `&:hover {
    background-color: #005900;
    transition: all 0.2s;
  }`}
`;

function Status({ socket, status, id, reload }) {
  switch (status) {
    case 0:
      return (
        <span>
          รอการยืนยัน{" "}
          <Danger onClick={() => socket.emit("cancel", id)}>ยกเลิก</Danger>
        </span>
      );
    case 1:
      return "กำลังทำ";
    case 2:
      return "เสิร์ฟแล้ว";
    case 3:
      return "ถูกยกเลิก";
    default:
      return null;
  }
}

function FoodList({ data, socket, reload }) {
  const list =
    data?.length > 0 ? (
      data.map((map) => (
        <FoodBlock key={map.id}>
          <img src={map.img} alt="food" />
          <div>
            <span className="title">{map.name}</span>
            <span className="price">
              ราคา {numeral(map.price).format("0,0.00")} บาท
            </span>
            <span className="quantity">จำนวน {map.quantity}</span>
            <span className="status">
              <Status
                socket={socket}
                reload={reload}
                status={parseInt(map.status)}
                id={map.id}
              />
            </span>
          </div>
        </FoodBlock>
      ))
    ) : (
      <NoneText>ไม่มีรายการ</NoneText>
    );

  return list;
}

const ModalStyled = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 2;

  .background {
    position: fixed;
    left: 0;
    top: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.4);
  }

  .modal {
    padding: 10px;
    border-radius: 3px;
    position: fixed;
    left: 50%;
    top: 50%;
    transform: translate(-50%, -50%);
    width: 80%;
    height: 40%;
    background-color: white;
  }
`;

const BilledModal = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
  justify-content: space-between;

  big {
    margin-bottom: 10px;
    font-size: calc(1.1em + 1px);
    font-weight: bold;
  }

  & > span {
    display: flex;
    flex-direction: column;
  }

  & > div {
    display: flex;
    justify-content: space-between;
  }
`;

const BilledButton = styled.button`
  width: 42%;
  border: none;
  border-radius: 3px;
  color: white;
  padding: 6px;
  background-color: ${(props) => (props.danger ? "red" : "green")};

  &:hover {
    background-color: ${(props) => (props.danger ? "#ab0000" : "#004a00")};
    transition: all 0.3s;
  }

  @media only screen and (min-width: 800px) {
    & {
      font-size: 0.7em;
    }
  }
`;

function Modal({ data, closeEmit, force }) {
  return (
    <ModalStyled>
      <div
        className="background"
        onClick={!force ? () => closeEmit() : null}
      ></div>
      <div className="modal">{data}</div>
    </ModalStyled>
  );
}

const BillingModal = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
  height: 100%;
  position: relative;

  svg {
    color: #555;
  }
`;

const TotalPayment = styled.span`
  font-size: 1.4em;
  text-decoration: underline;
`;

function BillingModalStyled({ price }) {
  return (
    <BillingModal>
      <TotalPayment>รวมสุทธิที่ต้องจ่าย</TotalPayment>
      <span>{numeral(price).format("0,0.00")} บาท</span>
      <BillLoader color="#aaa" type="ThreeDots" />
      <span>กรุณารอพนักงาน</span>
    </BillingModal>
  );
}

function Cart() {
  const { data, error, reload } = useAuthAPI(`/restaurant/order/select.php`);
  const [modal, modalSet] = useState();
  const [force, forceSet] = useState(false);
  const match = useRouteMatch();
  const history = useHistory();

  const { socket, connected } = useContext(Socket);

  useEffect(() => {
    socket.on("update", reload);
    socket.on("billing", () => history.push(`${match.url}/billing`));
    socket.on("cancelBill", () => {
      history.push(`${match.url}`);
      modalSet();
    });
    return () => {
      socket.off("update");
      socket.off("billing");
      socket.off("cancelBill");
    };
  });

  function checkBill() {
    socket.emit("checkBill");
    forceSet(true);
    history.push(`${match.url}/billing`);
  }

  if (error) return error;
  if (data?.message === "success" && connected) {
    const totalPrice = data.result?.length > 0 ? data.result[0].total : 0;

    return (
      <>
        <Switch>
          <Route path={`${match.path}/billing`}>
            <Modal
              data={<BillingModalStyled price={totalPrice} />}
              closeEmit={modalSet}
              force={force}
            />
          </Route>
          <Route path={`${match.path}`}>
            {modal && <Modal data={modal} closeEmit={modalSet} force={force} />}
          </Route>
        </Switch>
        <CartContainer>
          <StatusLabel>
            อยู่ในกระบวนการ
            <br />
            <FoodList
              socket={socket}
              reload={reload}
              data={data.result?.filter((filter) => filter.status < 2)}
            />
          </StatusLabel>
          <StatusLabel>
            เสิร์ฟแล้ว
            <br />
            <FoodList
              data={data.result?.filter(
                (filter) => parseInt(filter.status) === 2
              )}
            />
          </StatusLabel>
          <StatusLabel>
            ยกเลิกแล้ว
            <br />
            <FoodList
              data={data.result?.filter(
                (filter) => parseInt(filter.status) === 3
              )}
            />
          </StatusLabel>
        </CartContainer>
        <TotalBar>
          <span>
            รวมทั้งสิ้น {numeral(totalPrice).format("0,0.00") + " "}
            บาท
          </span>
          <Billed
            disabled={data.result?.length === 0 || totalPrice <= 0}
            onClick={() =>
              modalSet(
                <BilledModal>
                  <span>
                    <big>ยืนยันการส่งคำขอเรียกเก็บเงิน</big>
                    <span>
                      เมื่อยืนยันจะไม่สามารถสั่งอาหารเพิ่มได้อีก
                      จากนั้นจะมีพนักงานมาดำเนินการชำระ กรุณาเตรียมเงินให้พร้อม
                    </span>
                  </span>
                  <div>
                    <BilledButton danger onClick={() => modalSet()}>
                      ยกเลิก
                    </BilledButton>
                    <BilledButton onClick={checkBill}>ยืนยัน</BilledButton>
                  </div>
                </BilledModal>
              )
            }
          >
            เรียกเก็บเงิน
          </Billed>
        </TotalBar>
      </>
    );
  }
  return <Loader />;
}

export default Cart;
