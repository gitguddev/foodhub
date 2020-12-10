import React from "react";
import styled, { keyframes } from "styled-components";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import { faHeart, faQrcode, faStore } from "@fortawesome/free-solid-svg-icons";
import { Link } from "react-router-dom";

const ScaleUp = keyframes`
  from {
    transform: scale(0.5);
  }
  to {
    transform: scale(1);
  }
  `;

const ContainerStyled = styled.div`
  width: 100vw;
  height: 100vh;
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

function Container() {
  return (
    <ContainerStyled>
      <div>FoodHub</div>
      <Footer>
        {/* <span style={{ fontSize: "0.9em" }}> */}
        {/*   {/1* <FontAwesomeIcon icon={faQrcode} /> สแกนเพื่อเริ่มสั่งเลย *1/} */}
        {/*   เริ่มใช้งานเลย */}
        {/* </span> */}
        <Button color={["#232323", "#555555"]}>
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
