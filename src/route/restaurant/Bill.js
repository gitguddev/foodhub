import React, { Fragment, useEffect, useRef } from "react";
import { useAuthAPI } from "../../utils/apiFetcher";
import Loader from "../../utils/Loader";
import styled from "styled-components";
import numeral from "numeral";
import html2canvas from "html2canvas";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import { Link, Redirect } from "react-router-dom";

import { faHome, faSave } from "@fortawesome/free-solid-svg-icons";

const Title = styled.span`
  font-size: 1.2em;
  font-weight: bold;
`;

const BillContainer = styled.div`
  background-color: #232323;
  color: white;
  padding: 15px;
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
`;

const BillPaper = styled.div`
  height: ${(props) => props.height}px;
  width: ${(props) => props.width}px;
  // box-shadow: 0px 0px 15px 4px black;
  margin: 15px 0;
  overflow: auto;
  display: flex;
  flex-direction: column;
  padding: 3px;
  align-items: center;
  font-size: calc(0.5vw + 0.5vh + 7px);
  background-color: white;
  color: black;
  border-radius: 4px;
`;

const Button = styled.button`
  border: none;
  border-radius: 3px;
  background-color: ${(props) => (props.blue ? "blue" : "green")};
  color: white;
  padding: 5px 13px;
  transition: all 0.3s;

  &:hover {
    background-color: ${(props) => (props.blue ? "#000080" : "#002e00")};
    transition: all 0.3s;
  }
`;

const ButtonContainer = styled.div`
  display: flex;
  & > * {
    margin: 5px;
  }
`;

const BillStyled = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  grid-auto-rows: min-content;
  font-size: 0.8em;

  margin-top: 20px;
  width: 100%;
  z-index: 1;
  text-align: center;

  span:nth-child(1),
  span:nth-child(2),
  span:nth-child(3) {
    text-align: center !important;
    font-weight: bold;
  }
`;

function BillPaperStyled({ billRef, width, height, data }) {
  const eachItem = [
    <Fragment key={"head"}>
      <span>ชื่อรายการ</span>
      <span>จำนวน</span>
      <span>รวม</span>
    </Fragment>,
    ...data.map((map) => {
      const { name, quantity, total } = map;

      return (
        <Fragment key={name}>
          <span>{name}</span>
          <span>{quantity}</span>
          <span>{total}</span>
        </Fragment>
      );
    }),
  ];

  function TimePassed({ data }) {
    const { year, month, day, hour, minute, second } = data;
    let thatTime = new Date(year, month, day, hour, minute, second);
    let thisTime = new Date();

    console.log(thatTime, thisTime);

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

  function CurrentDate({ data }) {
    const { year, month, day, hour, minute, second } = data;
    const monthList = [
      "มกราคม",
      "กุมภาพันธ์",
      "มีนาคม",
      "เมษายน",
      "พฤษภาคม",
      "มิถุนายน",
      "กรกฏาคม",
      "สิงหาคม",
      "กันยายน",
      "ตุลาคม",
      "พฤศจิกายน",
      "ธันวาคม",
    ];

    return (
      <span>
        {day} {monthList[month]} {parseInt(year) + 543}
      </span>
    );
  }

  return (
    <BillPaper ref={billRef} width={width} height={height}>
      <span>
        <u>
          <big>
            <big>{data[0].restaurant_name}</big>
          </big>
        </u>
      </span>
      <small style={{ marginBottom: 8 }}>โต๊ะที่ {data[0].table_number}</small>
      <small>
        วันที่ <CurrentDate data={data[0]} />
      </small>
      <small>
        ใช้เวลาทั้งหมด <TimePassed data={data[0]} />
      </small>
      <small>ทั้งหมด {data.length} รายการ</small>
      <BillStyled>{eachItem}</BillStyled>
      <span style={{ marginTop: 25 }}>
        รวมทั้งสิ้น{" "}
        {numeral(
          data.reduce((current, value) => {
            return current + parseFloat(value.total);
          }, 0)
        ).format("0,0.00")}{" "}
        บาท
      </span>
    </BillPaper>
  );
}

function Bill() {
  const { data, error } = useAuthAPI(`/restaurant/bill/get.php`);
  const message = data?.message || "loading";
  const billRef = useRef(null);
  console.log(data);

  useEffect(() => {
    if (message === "success") window.localStorage.removeItem("auth");
  }, [message]);

  function Save() {
    billRef.current.style.overflow = "visible";
    html2canvas(billRef.current, {
      height: billRef.current.scrollHeight,
      backgroundColor: "#fff",
    }).then((canvas) => {
      window.location.href = canvas
        .toDataURL()
        .replace("image/png", "image/octet-stream");
      billRef.current.style.overflow = "auto";
    });
  }

  if (error) return error;
  if (data?.message === "success") {
    if (!data.result?.length) return <Redirect to="/" />;
    let width, height;
    if (window.screen.width > window.screen.height) {
      height = (window.screen.height / 100) * 80;
      width = height * 1.4124 - height;
    } else {
      width = (window.screen.width / 100) * 80;
      height = width * 1.4142;
    }
    return (
      <BillContainer>
        <Title>การชำระเสร็จสิ้น !</Title>
        <span>ขอบคุณที่ใช้บริการ</span>
        <BillPaperStyled
          billRef={billRef}
          width={width}
          height={height}
          data={data.result}
        />
        <ButtonContainer>
          <Link to="/">
            <Button>
              <FontAwesomeIcon icon={faHome} /> เสร็จสิ้น
            </Button>
          </Link>
          <a onClick={Save}>
            <Button blue>
              <FontAwesomeIcon icon={faSave} /> บันทึก
            </Button>
          </a>
        </ButtonContainer>
      </BillContainer>
    );
  }
  return <Loader />;
}

export default Bill;
