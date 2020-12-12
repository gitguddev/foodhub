import React, { useEffect, useRef, useState } from "react";
import styled, { keyframes } from "styled-components";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import { faHeart, faQrcode, faStore } from "@fortawesome/free-solid-svg-icons";
import { Link } from "react-router-dom";

import SmartphoneFrame from "../Smartphone_Frame.svg";
import MobileApp from "../MobileApp.png";
import LandingPreview from "../PreviewLanding.svg";
import QrScanner from "qr-scanner";

const ScaleUp = keyframes`
  from {
    transform: scale(0.5);
  }
  to {
    transform: scale(1);
  }
  `;

const ContainerStyled = styled.div`
  width: 100%;
  height: 100%;
  background-color: #232323;
  color: white;
  display: grid;
  grid-template-rows: 3.5fr 1fr auto;
  font-size: calc(1vw + 1vh + 5px);
`;

const Footer = styled.div`
  background-color: white;
  display: flex;
  justify-content: center;
  align-items: center;
  box-shadow: -3px 0px 50px 5px black;
  color: black;
  // flex-direction: column;
`;

const About = styled.div`
  padding: 15px 10px;
  font-size: 0.8em;

  a {
    text-decoration: none;
    color: white;
  }
`;

const Button = styled.button`
  border: none;
  color: white;
  padding: 10px 15px;
  font-size: 1em;
  background-color: ${(props) => props.color[0]};
  border-radius: 3px;
  transition: all 0.2s;
  margin: 10px;
  animation: ${ScaleUp} 0.3s;

  &:hover {
    background-color: ${(props) => props.color[1]};
    transition: all 0.2s;
    transform: translateY(-10px);
    cursor: pointer;
  }
`;

const PromotionContainer = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  grid-template-rows: [title-start] 25% [title-end preview-start] 1fr [preview-end];
  justify-items: center;
  align-items: center;
  height: 100%;

  @media only screen and (max-width: 800px) {
    grid-template-rows: [title-start] 25% [title-end preview-start] 1fr [preview-end];
  }

  overflow: hidden;
`;

const Detail = styled.span`
  font-size: calc(1vw + 2vh);

  @media only screen and (max-width: 800px) {
    font-size: calc(1vw + 3vh);
  }
`;

const Title = styled.span`
  font-size: 1.5em;
  font-weight: bold;
`;

const LandingImg = styled.img`
  height: 100%;
  width: 100%;
`;

function Container() {
  const videoRef = useRef();
  const [scanner, scannerSet] = useState();
  const [scanning, scanningSet] = useState(false);

  useEffect(() => {
    if (scanning) {
      let sc = new QrScanner(
        videoRef.current,
        (result) => (window.location.href = result)
      );
      // scannerSet(sc);
      sc.start();
      return () => {
        sc.stop();
        sc.destroy();
        sc = null;
      };
    }
  }, [scanning, scanner]);

  function StartScan() {
    scanningSet(!scanning);
  }

  return (
    <ContainerStyled>
      <PromotionContainer>
        {!scanning ? (
          <>
            <Detail>
              <Title>FoodHub</Title>
              <br />
              แพลตฟอร์มสำหรับร้านอาหาร
            </Detail>

            <LandingImg src={LandingPreview} alt="Preview" />
          </>
        ) : (
          <video
            style={{ gridRow: "1 / 3", width: "100%" }}
            ref={videoRef}
          ></video>
        )}
      </PromotionContainer>
      <Footer>
        {/* <span style={{ fontSize: "0.9em" }}> */}
        {/*   {/1* <FontAwesomeIcon icon={faQrcode} /> สแกนเพื่อเริ่มสั่งเลย *1/} */}
        {/*   เริ่มใช้งานเลย */}
        {/* </span> */}
        <Button onClick={StartScan} color={["#232323", "#555555"]}>
          <FontAwesomeIcon icon={faQrcode} /> สแกนเพื่อสั่ง
        </Button>
        <span style={{ color: "#555555", fontSize: "0.8em" }}>
          {" "}
          | เริ่มใช้งานเลย |{" "}
        </span>
        <Link to="/manager/sign-in">
          <Button color={["#232323", "#555555"]}>
            <FontAwesomeIcon icon={faStore} /> สร้างร้านอาหาร
          </Button>
        </Link>
      </Footer>
      <About>
        <span>
          Made with <FontAwesomeIcon icon={faHeart} style={{ color: "red" }} />{" "}
          by
        </span>{" "}
        <a target="_blank" href="https://gitguddev.github.io/website">
          GitGud Dev
        </a>
      </About>
    </ContainerStyled>
  );
}

function Landing() {
  return <Container />;
}

export default Landing;
