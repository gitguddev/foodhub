import React from "react";
import styled from "styled-components";
import { default as ReactLoader } from "react-loader-spinner";
const LoaderContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  width: 100vw;
  position: fixed;
  top: 0;
  left: 0;
`;

function Loader(props) {
  return (
    <LoaderContainer>
      <ReactLoader type="ThreeDots" color="#aaa" {...props} />
    </LoaderContainer>
  );
}

export default Loader;
