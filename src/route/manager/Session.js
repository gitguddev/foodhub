import React, { Fragment, useContext, useEffect, useState } from "react";
import { useAsync } from "react-async";
import apiFetcher from "../../utils/apiFetcher";
import { Auth } from "../../utils/firebase";
import { useParams } from "react-router-dom";
import Loader from "../../utils/Loader";
import styled, { keyframes } from "styled-components";
import numeral from "numeral";
import { Socket } from "./Manager";

const SessionContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  grid-gap: 15px;
`;

const infoBoxAnimation = keyframes`
  from {
    height: 0vh;
    opacity: 0;
  }
  to{ 
    height: 50vh;
    opacity: 1;
  }
`;

const SessionBox = styled.div`
  align-self: flex-start;
  border: 2px solid
    ${(props) => (parseInt(props.status) === 1 ? "red" : "#232323")};
  padding: 25px 10px 10px 10px;
  border-radius: 4px;
  display: flex;
  flex-direction: column;
  font-size: calc(3vh + 1px);
  text-align: center;
  /*box-shadow: 0 1px 4px 1px #999;*/
  position: relative;
  margin: 14px 0px;
  font-size: 0.8em;

  b {
    box-shadow: 0 1px 2px 0px #999;
    font-size: 1.1em;
    position: absolute;
    left: 15px;
    top: -26px;
    background-color: ${(props) =>
      parseInt(props.status) === 1 ? "red" : "#232323"};
    padding: 0px 20px;
    color: white;
    border-radius: 4px;
    transition: all 0.4s;
  }

  &:hover {
    transition: all 0.4s;
    cursor: pointer;
    user-select: none;
  }

  &:hover b {
    left: 25px;
    transition: all 0.4s;
  }

  @media only screen and (max-width: 800px) {
    & {
      padding: 10px;
      font-size: 1em;
    }
  }

  .infoBox {
  }
  .infoBox:hover {
    cursor: default;
  }
`;

const BillStyled = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  grid-auto-rows: min-content;
  font-size: 0.8em;

  margin-top: 10px;
  animation: ${infoBoxAnimation} 1s;
  width: 100%;
  height: 50vh;
  z-index: 1;

  span:nth-child(1),
  span:nth-child(2),
  span:nth-child(3) {
    text-align: center !important;
    font-weight: bold;
  }
  overflow: auto;
`;

const BillButton = styled.button`
  margin-top: 10px;
  padding: 5px;
  background-color: ${(props) => (props.grey ? "grey" : "green")};
  color: white;
  font-weight: bold;
  border: none;
  border-radius: 3px;
  width: ${(props) => (parseInt(props.status) === 1 ? "48%" : "100%")};

  &:hover {
    background-color: ${(props) => (props.grey ? "#5c5c5c" : "#005200")};
    cursor: pointer;
  }
`;

function Bill({ sessionId, reloader, status, table_number }) {
  const { restaurant_id } = useParams();
  const { socket, connected } = useContext(Socket);
  const { data, error, reload } = useAsync({
    promiseFn: apiFetcher,
    url: `/manager/order/food_table.php?user_uid=${Auth.currentUser.uid}&restaurant_id=${restaurant_id}&session_id=${sessionId}`,
  });

  useEffect(() => {
    socket.on("order", reload);
    socket.on("cancel", reload);
    socket.on("update", reload);
    return () => {
      socket.off("order");
      socket.off("cancel");
      socket.off("update");
    };
  }, [reload, restaurant_id, socket]);

  async function cancelBill(id) {
    const json = await apiFetcher({
      url: `/manager/session/cancel.php?id=${id}&user_uid=${Auth.currentUser.uid}&restaurant_id=${restaurant_id}`,
    });

    if (json.message === "success") {
      reloader();
      socket.emit("cancelBill", restaurant_id);
    } else {
      console.error(json.message);
    }
  }

  async function completeBill(id) {
    const json = await apiFetcher({
      url: `/manager/session/complete.php?id=${id}&user_uid=${Auth.currentUser.uid}&restaurant_id=${restaurant_id}`,
    });

    if (json.message === "success") {
      reloader();
      socket.emit("completeBill", restaurant_id, table_number);
    } else {
      console.error(json.message);
    }
  }

  if (error) return error;
  if (data?.message === "success") {
    if (data.result?.length > 0) {
      const eachItem = [
        <Fragment key="head">
          <span>ชื่อ</span>
          <span>จำนวน</span>
          <span>รวม</span>
        </Fragment>,
        ...data.result.map((map) => {
          const { name, quantity, total } = map;

          return (
            <Fragment key={name + quantity}>
              <span style={{ textAlign: "left" }}>{name}</span>
              <span>{quantity}</span>
              <span>{total}</span>
            </Fragment>
          );
        }),
      ];

      return (
        <>
          <BillStyled>{eachItem}</BillStyled>
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            {parseInt(status) === 1 && (
              <BillButton
                status={status}
                grey
                onClick={() => cancelBill(sessionId)}
              >
                ยกเลิกคำขอชำระ
              </BillButton>
            )}
            <BillButton status={status} onClick={() => completeBill(sessionId)}>
              เสร็จสิ้น
            </BillButton>
          </div>
        </>
      );
    } else {
      return (
        <span style={{ marginTop: 15, fontSize: "0.9em" }}>
          ไม่มีการสั่งอาหาร
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <BillButton
              style={{ width: "100%" }}
              onClick={() => completeBill(sessionId)}
            >
              เสร็จสิ้น
            </BillButton>
          </div>
        </span>
      );
    }
  }
  return <Loader />;
}

const ConfirmBT = styled.button`
  border: none;
  padding: 5px 10px;
  border-radius: 3px;
  color: white;
  margin-top: 10px;

  background-color: ${(props) => (props.danger ? "red" : "blue")};
  transition: all 0.2s;

  &:hover {
    background-color: ${(props) => (props.danger ? "#940100" : "#00007b")};
    transition: all 0.2s;
    cursor: pointer;
  }
`;

function SessionTable({ data, reloader }) {
  const [time, timeSet] = useState(new Date());
  const [clicked, clickedSet] = useState(false);
  const { restaurant_id } = useParams();

  useEffect(() => {
    const timer = setTimeout(() => timeSet(new Date()), 1000);
    return () => {
      clearTimeout(timer);
    };
  }, [time]);

  function TimePassed({ data }) {
    const { year, month, day, hour, minute, second } = data;
    let thatTime = new Date(year, month, day, hour, minute, second);
    let thisTime = time;

    let diff = thisTime.getTime() - thatTime.getTime();

    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);

    return (
      <span>{`${hours}:${numeral(minutes - hours * 60).format("00")}:${numeral(
        seconds - minutes * 60
      ).format("00")}`}</span>
    );
  }

  function handleClick(table_number) {
    clickedSet(clicked === table_number ? null : table_number);
  }

  async function sessionsAccept(id) {
    const json = await apiFetcher({
      url: `/manager/session/operation.php?method=accept&id=${id}&restaurant_id=${restaurant_id}&user_uid=${Auth.currentUser.uid}`,
    });

    if (json?.message === "success") {
      reloader();
    } else {
      console.error(json?.message);
    }
  }

  async function sessionsDelete(id) {
    const json = await apiFetcher({
      url: `/manager/session/operation.php?method=delete&id=${id}&restaurant_id=${restaurant_id}&user_uid=${Auth.currentUser.uid}`,
    });

    if (json?.message === "success") {
      reloader();
    } else {
      console.error(json?.message);
    }
  }

  if (data === null) return <span>ไม่มีลูกค้าอยู่ในร้านขณะนี้</span>;

  const tableList = data.map((map) => (
    <SessionBox
      key={map.id}
      status={map.status}
      onClick={
        parseInt(map.confirm) === 1 ? () => handleClick(map.table_number) : null
      }
    >
      <b>โต๊ะที่ {map.table_number}</b>
      {parseInt(map.confirm) === 1 && (
        <>
          <span>จำนวนอาหารที่สั่ง {map.total_order}</span>
          <span>รวมสุทธิ {numeral(map.total || 0).format("0,0.00")}</span>
          <span>
            ระยะเวลา <TimePassed data={map} />
          </span>
        </>
      )}
      {parseInt(map.confirm) === 0 ? (
        <>
          <span>กำลังรอการยืนยัน</span>
          <ConfirmBT onClick={() => sessionsAccept(map.id)}>ยืนยัน</ConfirmBT>
          <ConfirmBT onClick={() => sessionsDelete(map.id)} danger>
            ยกเลิก
          </ConfirmBT>
        </>
      ) : (
        parseInt(map.status) === 1 && (
          <span
            style={{
              fontSize: "1.2em",
              marginTop: 15,
              fontWeight: "bold",
              color: "red",
            }}
          >
            มีคำเรียกขอเก็บเงิน
          </span>
        )
      )}
      {clicked === map.table_number && (
        <Bill
          sessionId={map.id}
          reloader={reloader}
          status={map.status}
          table_number={map.table_number}
        />
      )}
    </SessionBox>
  ));

  return <SessionContainer>{tableList}</SessionContainer>;
}

function Session() {
  const { restaurant_id } = useParams();
  const { data, error, reload, cancel, isPending } = useAsync({
    promiseFn: apiFetcher,
    url: `/manager/session/get.php?restaurant_id=${restaurant_id}&user_uid=${Auth.currentUser.uid}`,
  });

  const { socket, connected } = useContext(Socket);

  function Fetcher() {
    const timer = setInterval(reload, 1000);
    socket.on("checkBillPage", () => {
      if (isPending) cancel();
      reload();
    });
    socket.on("order", reload);
    socket.on("cancel", reload);
    socket.on("update", reload);
    return () => {
      clearInterval(timer);
      socket.off("checkBillPage");
      cancel();
    };
  }

  useEffect(Fetcher, [restaurant_id, reload, socket, cancel, data]);

  if (error) return error;
  if (data?.message === "success" && connected)
    return <SessionTable data={data.result} reloader={reload} />;
  return <Loader />;
}

export default Session;
