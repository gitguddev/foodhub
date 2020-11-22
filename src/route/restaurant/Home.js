import React, { useEffect, useState } from "react";
import { ReactComponent as Food } from "./Popular Food.svg";
import { Link } from "react-router-dom";
//import RestaurantStyle from "./Restaurant.module.css";
import styled, { keyframes } from "styled-components";
import { useAuthAPI } from "../../utils/apiFetcher";
import Loader from "../../utils/Loader";
import numeral from "numeral";

const DashboardStyled = styled.div`
  background-color: #232323;
  color: white;
  font-size: calc(2vh + 6px);
  margin-top: -10px;
  height: calc(60% + 10px);
  position: relative;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  padding: 10px;
`;

const RestaurantThumbnail = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
  position: absolute;
  opacity: 0.1;
`;

const Title = styled.span`
  font-size: 1.5em;
`;
const Info = styled.span`
  font-size: 1em;
`;
const Detail = styled.span`
  font-size: 1em;
`;

const Slider = keyframes`
	0% {
		left: 0;
	}
	50% {
		left: calc(100vw - 1040px);
	}
	100% {
		left: 0;
	}
`;

const SliderIPAD = keyframes`
	0% {
		left: 0;
	}
	50% {
		left: calc(100vw - 2000px);
	}
	100% {
		left: 0;
	}
`;

const FoodCatalogContainer = styled.div`
  height: 40%;
  position: relative;
`;

const FoodCatalog = styled.div`
  height: 100%;
  display: flex;
  position: absolute;
  padding: 10px;
  animation: ${Slider} 20s infinite;

  &:hover {
    animation-play-state: paused;
  }

  img {
    margin: 10px;
    height: calc(100% - 10px);
    width: 150px;
    border-radius: 3px;
    object-fit: cover;
    user-select: none;
  }

  @media only screen and (min-width: 1024px) {
    animation: ${SliderIPAD} 20s infinite;
    img {
      width: 310px;
    }
  }
`;

const CatalogButton = styled.button`
  background-color: transparent;
  color: white;
  border: 2px solid white;
  border-radius: 4px;
  margin: 15px 0;
  font-size: 1em;
  padding: 6px;

  z-index: 2;

  &:hover {
    background-color: rgba(255, 255, 255, 0.1);
    transition: all 0.3s;
  }
`;

const RecommendLabel = styled.div`
  position: absolute;
  bottom: 0;
  transform: translateY(30%);
  left: 20px;
  border-radius: 3px;
  padding: 3px 8px;
  color: white;
  background-color: #232323;
  box-shadow: 0px 1px 2px 0px #000;
  font-size: 0.8em;
`;

function FoodCatalogStyled() {
  const { data, error } = useAuthAPI(`/restaurant/food/list.php`);

  if (error) return error;
  if (data?.message === "success") {
    const catalog = data.result
      .filter((filter, index) => index < 6)
      .map((map) => <img key={map.id} src={map.img} alt="food" />);
    return <FoodCatalog onTouchStart={() => {}}>{catalog}</FoodCatalog>;
  }
  return <Loader />;
}

function Home() {
  const { data, error } = useAuthAPI(`/restaurant/get.php`);
  const [time, timeSet] = useState(new Date());

  useEffect(() => {
    const timeState = setTimeout(() => timeSet(new Date()), 1000);
    return () => clearTimeout(timeState);
  });

  function TimePassed() {
    const { year, month, day, hour, minute, second } = data.result;
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

  if (error) return error;
  if (data?.message === "success")
    return (
      <>
        <DashboardStyled>
          <RestaurantThumbnail src={data.result.img} />
          <Title>{data.result.name}</Title>
          <Info>{data.result.info}</Info>
          <br />
          <Detail>เลขที่โต๊ะ {data.result.table}</Detail>
          <Detail>
            เวลาที่ใช้ <TimePassed />
          </Detail>
          <Detail>
            รวมยอดสุทธิ {numeral(data.result.total).format("0,0.00")} บาท
          </Detail>
          <CatalogButton>ดูรายการอาหาร</CatalogButton>
          <RecommendLabel>แนะนำ</RecommendLabel>
        </DashboardStyled>
        <FoodCatalogContainer>
          <FoodCatalogStyled />
        </FoodCatalogContainer>
        {/*<Food className={RestaurantStyle.popularFood} />
      <Link to="/catalog">
        <div className={RestaurantStyle.seeMore}>ดูเมนูทั้งหมด</div>
      </Link>*/}
      </>
    );
  return <Loader />;
}

export default Home;
