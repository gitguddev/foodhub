import React, { useEffect, useState, useContext } from "react";
import { useAuthAPI } from "../../utils/apiFetcher";
import Loader from "../../utils/Loader";
import styled, { keyframes } from "styled-components";
import {
  Link,
  useParams,
  useRouteMatch,
  Route,
  Switch,
  useHistory,
} from "react-router-dom";
import numeral from "numeral";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faShoppingCart } from "@fortawesome/free-solid-svg-icons";
import { Socket } from "./Restaurant";

const FadeIn = keyframes`
from {
	opacity: 0;
	top: -100px;
}
to {
	opacity: 1;
	top: 50%;
}
`;

const Blurer = styled.div`
  ${(props) => props.blur && "filter: blur(3px);"}
`;

const CategoryContainerStyled = styled.div`
  display: flex;
  flex-direction: column;

  .categorizedFood {
    margin-bottom: 10px;
  }
`;

const FoodContainerStyled = styled.div`
  padding: 10px;

  .categoryTitle {
    font-size: 1.5em;
  }

  .background {
    background-color: black;
    height: 100%;
    width: 100%;
    position: fixed;
    top: 0;
    left: 0;
    z-index: 1;
    opacity: 0.2;
  }

  .modal {
    animation: ${FadeIn} 0.5s;
    width: 80%;
    height: 80%;
    background-color: white;
    padding: 10px;
    border-radius: 5px;
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    z-index: 2;
  }
`;

const FoodInfoStyled = styled.div`
  height: 100%;
  width: 100%;
  font-size: calc(9px + 0.9vh);
  position: relative;

  img {
    width: 100%;
    height: 50%;
    object-fit: cover;
  }

  .description {
    height: 50%;
    display: flex;
    flex-direction: column;
  }

  .title {
    font-weight: bold;
    font-size: 1.4em;
  }
  i {
    margin-top: 10px;
    font-size: 0.9em;
  }
  .orderSection {
    background-color: white;
    position: absolute;
    width: 100%;
    bottom: 0;
    display: flex;
  }
  .orderSection > div:first-child {
    flex: 2;
  }
  .orderSection > * {
    margin: 5px;
  }
`;

const OrderButtonStyled = styled.button`
  background-color: ${(props) => (props.disabled ? "grey" : "green")};
  color: white;
  font-weight: bold;
  border: none;
  border-radius: 5px;
  padding: 10px;
  font-size: 1.1em;
  height: 95px;
  align-self: flex-end;

  &:hover {
    background-color: #004e00;
    transition: all 0.2s;
    cursor: pointer;
  }
`;

const NoteInputStyled = styled.input.attrs((props) => ({
  type: "text",
  required: true,
  placeholder: "หมายเหตุ เช่น ไม่ใส่ผัก หรือกระเทียม",
}))`
  padding: 6px;
  font-size: 1.1em;
  border: 1px solid #232323;
  border-radius: 3px;
  width: 100%;
`;

const QuantityInputStyled = styled.input.attrs((props) => ({
  type: "number",
  min: 0,
  max: 99,
  required: true,
  placeholder: "จำนวน",
}))`
  padding: 6px;
  font-size: 1.1em;
  border: 1px solid #232323;
  border-radius: 3px;
  width: 100%;
`;

const FoodListStyled = styled.div`
  display: grid;
  ${(props) =>
    props.category
      ? "grid-template-columns: repeat(10, 140px);"
      : "grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));"}
  grid-gap: 10px;
  overflow-x: auto;
  padding-bottom: 10px;
  scroll-behavior: smooth;

  &::-webkit-scrollbar {
    height: 9px;
  }
  &::-webkit-scrollbar-track {
    background: #232323;
  }
  &::-webkit-scrollbar-thumb {
    background-color: white;
    border-radius: 20px;
    border: 1px solid #232323;
  }

  .foodCard {
    border-radius: 3px;
    display: grid;
    overflow: hidden;
    grid-template-columns: 1fr;
    grid-template-rows: 140px;
    justify-items: center;
  }

  .foodCard img {
    height: 100%;
    width: 100%;
    object-fit: cover;
  }
`;

function SearchFood({ search, modalSet }) {
  const { data, error, reload, cancel } = useAuthAPI(
    `/restaurant/food/search.php?search=${search}`
  );
  const [timeout, timeoutSet] = useState();

  function reloader() {
    if (data?.message) data.message = "loading";
    cancel();
    clearTimeout(timeout);
    timeoutSet(setTimeout(reload, 500));
  }

  useEffect(reloader, [search]);

  if (search.length === 0) return "ค้นหาอาหารด้วยชื่อของอาหาร";
  if (error) return error;
  if (data?.message === "success") {
    if (data.result?.length > 0)
      return (
        <>
          <span className="categoryTitle">ผลลัพท์การค้นหา</span> ทั้งหมด{" "}
          {data.result.length} รายการ
          <FoodList data={data.result} modalSet={modalSet} />
        </>
      );
    return "ไม่พบผลลัพท์การค้นหา";
  }
  return <Loader />;
}

function FoodInfo({ data, handleClose }) {
  const history = useHistory();

  const [quantity, quantitySet] = useState(1);
  const [note, noteSet] = useState("");

  const { socket, connected } = useContext(Socket);

  socket.on("billing", () => history.push("/restaurant/cart/billing"));

  function handleOrder() {
    socket.emit("order", data.id, quantity, note);
    handleClose();
  }

  function handleQuantityChange(event) {
    quantitySet(event.target.value);
  }

  function handleNoteChange(event) {
    noteSet(event.target.value);
  }

  return (
    <FoodInfoStyled>
      <img src={data.img} alt="food thumbnail" />
      <div className="description">
        <span className="title">{data.name}</span>
        <span className="price">
          ราคา {numeral(data.price).format("0,0.00")} บาท
        </span>
        <i>คำอธิบาย</i>
        <span className="info">{data.info}</span>
        <div className="orderSection">
          <div>
            จำนวน <span style={{ color: "red" }}>*</span>
            <QuantityInputStyled
              onChange={handleQuantityChange}
              value={quantity}
            />
            หมายเหตุ
            <NoteInputStyled onChange={handleNoteChange} value={note} />
          </div>
          <OrderButtonStyled onClick={handleOrder} disabled={!connected}>
            {" "}
            สั่งอาหาร <FontAwesomeIcon icon={faShoppingCart} />
          </OrderButtonStyled>
        </div>
      </div>
    </FoodInfoStyled>
  );
}

function FoodList({ data, modalSet, category }) {
  return (
    <FoodListStyled category={category}>
      {data.map((map) => (
        <div onClick={() => modalSet(map.id)} key={map.id} className="foodCard">
          <img alt="food" src={map.img} />
          <span>{map.name}</span>
        </div>
      ))}
    </FoodListStyled>
  );
}

function CategorizedFood({ blur, modalSet }) {
  const { category_id } = useParams();
  const { data, error } = useAuthAPI(
    `/restaurant/food/categorized_food.php?category_id=${category_id}`
  );

  if (error) return error;
  if (data?.message === "success")
    return (
      <>
        <span className="categoryTitle">{data.result[0].category_title}</span>{" "}
        ทั้งหมด {data.result.length} รายการ
        <FoodList data={data.result} modalSet={modalSet} />
      </>
    );
  return <Loader />;
}

function FoodContainer({ search }) {
  const match = useRouteMatch();
  const [foodID, foodIDSet] = useState();
  const { data, error, reload } = useAuthAPI(
    `/restaurant/food/get.php?id=${foodID}`
  );

  useEffect(reload, [foodID]);

  function handleClose() {
    foodIDSet();
  }

  if (error) return error;
  return (
    <FoodContainerStyled>
      <Blurer blur={!!foodID}>
        {search !== undefined ? (
          <SearchFood search={search} modalSet={foodIDSet} />
        ) : (
          <Switch>
            <Route path={`${match.path}/:category_id`}>
              <CategorizedFood modalSet={foodIDSet} />
            </Route>
            <Route path={`${match.path}`}>
              <CategoryContainer modalSet={foodIDSet} />
            </Route>
          </Switch>
        )}
      </Blurer>
      {foodID && (
        <>
          <div className="background" onClick={handleClose}></div>
          <div className="modal">
            {data?.message === "success" ? (
              <FoodInfo data={data.result} handleClose={handleClose} />
            ) : (
              <Loader />
            )}
          </div>
        </>
      )}
    </FoodContainerStyled>
  );
}

function CategoryContainer({ blur, modalSet }) {
  const match = useRouteMatch();
  const { data, error } = useAuthAPI("/restaurant/food/list.php");

  if (error) return error;
  if (data?.message === "success") {
    const category = data.result.map((map) => map.category_title);
    const uniquedCategory = [...new Set(category)];

    const categorizedFood = uniquedCategory.map((map) =>
      data.result
        .filter((filter_map, index) => filter_map.category_title === map)
        .filter((filter, index) => index < 10)
    );

    return (
      <CategoryContainerStyled>
        {categorizedFood.map((map, index) => (
          <div key={uniquedCategory[index]} className="categorizedFood">
            <span className="categorySpan">
              <span className="categoryTitle">{uniquedCategory[index]}</span>{" "}
              <Link to={`${match.url}/${map[0].category_id}`}>ดูทั้งหมด</Link>{" "}
            </span>
            <FoodList category data={map} modalSet={modalSet} />
          </div>
        ))}
      </CategoryContainerStyled>
    );
  }
  return <Loader />;
}

function Catalog({ search }) {
  return <FoodContainer search={search} />;
}

export default Catalog;
