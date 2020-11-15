import React, { useState, useRef } from "react";
import { useAsync } from "react-async";
import { Auth } from "../../utils/firebase";
import apiFetcher from "../../utils/apiFetcher";
import styled, { keyframes } from "styled-components";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import ManagerStyle from "./Manager.module.css";
import numeral from "numeral";
import {
  faBars,
  faEllipsisV,
  faPencilAlt,
  faTimes,
  faPlus,
  faPen,
  faTrash,
} from "@fortawesome/free-solid-svg-icons";
import {
  useParams,
  NavLink,
  useRouteMatch,
  Switch,
  Route,
  Link,
  useHistory,
} from "react-router-dom";
import { useEffect } from "react";

const Interface = styled.div`
  display: grid;
  grid-template-columns: 25% 1fr;
  grid-template-rows: 100%;
  height: 100%;
  border-radius: 3px;
  border: 1px solid #232323;
  font-size: 0.9em;
  position: relative;
  overflow: hidden;

  .title {
    background-color: #232323;
    color: white;
    text-align: center;
    border-bottom: 1px solid #151515;
    display: flex;
    padding: 0px 10px 0px 10px;
    align-items: center;
    justify-content: center;
  }

  .content {
    padding: 10px;
  }

  .content input {
    padding: 5px;
  }

  .lookup {
    display: flex;
    justify-content: space-between;
    margin-bottom: 10px;
  }
  .lookup input[type="text"] {
    border-radius: 3px;
    border: 1px solid #232323;
    width: 120px;
  }
  .lookup a:hover {
    color: #707070;
    cursor: pointer;
  }

  @media only screen and (min-width: 1000px) {
    .title svg {
      display: none;
    }
  }

  @media only screen and (max-width: 1000px) {
    .title {
      justify-content: space-between;
    }
    & {
      display: block;
    }
    .bar {
      position: absolute;
      width: 80%;
      height: 100%;
    }
  }
`;

const slideIn = keyframes`
	from {
		left: -100%;
	}
	to {
		left: 0;
	}
`;

const slideOut = keyframes`
	from {
		left: 0;
	}
	to {
		left: -100%;
	}
`;

const CategoryBar = styled.div`
  background-color: #232323;
  display: grid;
  grid-template-rows: 50px calc(100% - 50px);
  animation: ${(props) => (props.show ? slideIn : slideOut)} 0.5s forwards;
  z-index: 1;

  .CategoryList {
    display: flex;
    flex-direction: column;
    overflow-x: hidden;
    overflow-y: auto;
  }

  .CategoryButton {
    padding: 10px;
    color: white;
    border-bottom: 1px solid #151515;
    font-size: 0.9em;
    transition: all 0.3s;
  }

  .CategoryButton:hover,
  .selected {
    background-color: #505050;
    cursor: pointer;
    padding-left: 20px;
    transition: all 0.3s;
  }
  .CategoryMenu {
    display: grid;
    grid-gap: 5px;
    grid-template-columns: 1fr 50px;
    align-items: center;
  }
  .CategoryMenu svg {
    color: #888;
    font-size: 0.9em;
  }
  .CategoryMenu span {
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  .CategoryMenu > input {
    padding: 5px;
    width: 100%;
    grid-column: 1 / 3;
  }
  .CategoryOperater {
    display: flex;
    justify-content: space-between;
  }
  .CategoryOperater > svg:hover {
    color: white;
  }
`;

const FoodSection = styled.div`
  background-color: white;
  display: grid;
  grid-template-rows: 50px calc(100% - 50px);
  height: 100%;

  .form {
    height: 100%;
    overflow-y: auto;
    overflow-x: hidden;
    padding: 10px;
  }

  .form textarea {
    min-height: 80px !important;
  }

  .form img {
    width: 100%;
    height: 200px;
    object-fit: cover;
  }

  .fileForm {
    display: inline-grid;
    grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
    align-items: flex-start;
    grid-gap: 10px;
  }
  .fileForm img {
    background-color: #aaa;
  }
`;

const FoodList = styled.div`
  display: flex;
  flex-direction: column;
  padding: 15px;
  overflow-y: auto;
  height: 100%;

  .operation {
    position: absolute;
    right: 0;
    bottom: 0;
    font-size: 0.9em;
    color: #555;
  }
  .operation svg {
    margin: 5px;
  }
  .operation svg:hover {
    color: #ddd;
    cursor: pointer;
  }

  .foodBox {
    position: relative;
    border: 1px solid black;
    display: grid;
    grid-template-columns: 150px repeat(2, 1fr);
    grid-gap: 5px;
    grid-template-rows: 100px;
    align-items: center;
    justify-items: center;
    border-radius: 3px;
    margin-bottom: 10px;
    z-index: 0;
  }
  .foodBox > img {
    object-fit: cover;
    width: 100%;
    height: 100%;
    background-color: #ddd;
  }
  .foodBox > span {
    display: flex;
    flex-direction: column;
    font-weight: 600;
  }
  .header {
    font-size: 0.85em;
    font-weight: normal;
  }

  @media only screen and (max-width: 800px) {
    .foodBox {
      grid-template-columns: repeat(2, 1fr);
      grid-template-rows: 100px;
      align-items: start;
      padding-bottom: 40px;
    }
    .foodBox img {
      grid-column: 1 / 4;
    }
  }
`;

function FoodEdit() {
  const { restaurant_id, category_id, food_id } = useParams();
  const imageRef = useRef();
  const fileRef = useRef();
  const history = useHistory();
  const [foodName, foodNameSet] = useState("");
  const [price, priceSet] = useState("");
  const [info, infoSet] = useState("");
  const [status, statusSet] = useState();

  const { data, error } = useAsync({
    promiseFn: apiFetcher,
    url: `/manager/food/get.php?id=${food_id}&restaurant_id=${restaurant_id}&user_uid=${Auth.currentUser.uid}`,
    onResolve({ result }) {
      foodNameSet(result.name);
      priceSet(result.price);
      infoSet(result.info);
    },
  });

  function handleChange(target, setter) {
    setter(target.value);
  }

  function handleFoodNameChange({ target }) {
    handleChange(target, foodNameSet);
  }

  function handlePriceChange({ target }) {
    handleChange(target, priceSet);
  }

  function handleInfoChange({ target }) {
    handleChange(target, infoSet);
  }

  function handleImage({ target }) {
    const reader = new FileReader();

    reader.onload = (result) => {
      imageRef.current.src = result.target.result;
      imageRef.current.style = { display: "block" };
    };

    reader.readAsDataURL(target.files[0]);
  }

  async function handleSubmit(event) {
    event.preventDefault();

    const formData = new FormData();
    if (fileRef.current.files?.length > 0)
      formData.append("image", fileRef.current.files[0]);

    const json = await apiFetcher({
      url: `/manager/food/update.php?id=${food_id}&name=${foodName}&category_id=${category_id}&price=${price}&user_uid=${Auth.currentUser.uid}&restaurant_id=${restaurant_id}&info=${info}`,
      option: {
        method: "POST",
        body: formData,
      },
    });

    if (json.message === "success") {
      history.push(
        "/manager/restaurant/" + restaurant_id + "/database/food/" + category_id
      );
    } else {
      statusSet(<span className="error">มีปัญหาในการเพิ่มอาหาร</span>);
    }
  }

  if (error) return error;
  if (data?.message === "success")
    return (
      <form className={ManagerStyle.form + " form"} onSubmit={handleSubmit}>
        <big>แก้ไขข้อมูลอาหาร</big>
        <span>ชื่ออาหาร</span>
        <input
          placeholder="ชื่ออาหาร"
          value={foodName}
          onChange={handleFoodNameChange}
          type="text"
          required
        />
        <span>ราคา</span>
        <input
          placeholder="ราคา"
          value={price}
          onChange={handlePriceChange}
          type="text"
          required={true}
          pattern="\d*"
          title="เฉพาะตัวเลข 0-9 เท่านั้น"
        />
        <span>คำอธิบายอาหาร</span>
        <textarea
          placeholder="คำอธิบาย"
          value={info}
          onChange={handleInfoChange}
          required
        />
        <span>รูปอาหาร</span>
        <label className="fileForm">
          <input
            type="file"
            name="image"
            ref={fileRef}
            onChange={handleImage}
            accept="image/*"
          />
          <img src={data.result.img} alt="food" ref={imageRef} />
        </label>
        <br />
        {status}
        <input type="submit" value="เพิ่มอาหาร" />
      </form>
    );
  return "Loading";
}

function FoodListContainer() {
  const match = useRouteMatch();
  const { category_id, restaurant_id } = useParams();
  const [search, searchSet] = useState("");
  const { error, data, reload } = useAsync({
    promiseFn: apiFetcher,
    url: `/manager/food/categorized_list.php?restaurant_id=${restaurant_id}&category_id=${category_id}&user_uid=${Auth.currentUser.uid}`,
  });

  async function handleDelete(id) {
    if (window.confirm("ยืนยันการลบอาหาร")) {
      const json = await apiFetcher({
        url: `/manager/food/delete.php?id=${id}&user_uid=${Auth.currentUser.uid}&restaurant_id=${restaurant_id}`,
      });

      if (json.message === "success") {
        reload();
      }
    }
  }

  function handleSearch({ target }) {
    searchSet(target.value);
  }

  useEffect(() => {
    reload();
  }, [reload, category_id, restaurant_id]);

  if (error) return error;
  if (data?.message === "success")
    return (
      <FoodList>
        <div className="lookup">
          <label>
            ค้นหาอาหาร{" "}
            <input
              type="text"
              onChange={handleSearch}
              value={search}
              placeholder="ชื่ออาหาร"
            />
          </label>
          <Link to={`${match.url}/add`}>
            <label>
              <FontAwesomeIcon icon={faPlus} /> เพิ่มอาหาร
            </label>
          </Link>
        </div>
        {data.result ? (
          data.result
            .filter((filter) =>
              !search
                ? true
                : filter.name.toLowerCase().search(search) === -1
                ? false
                : true
            )
            .map((map) => {
              return [
                <div className="foodBox" key={map.id}>
                  <img src={map.img} alt="food" />
                  <span>
                    <span className="header">ชื่ออาหาร</span>
                    <span>{map.name}</span>
                  </span>
                  <span>
                    <span className="header">ราคา</span>
                    <span>{numeral(map.price).format("0,0.00")}</span>
                  </span>
                  <div className="operation">
                    <Link to={`${match.url}/edit/${map.id}`}>
                      <FontAwesomeIcon icon={faPen} />
                    </Link>
                    <FontAwesomeIcon
                      onClick={() => handleDelete(map.id)}
                      icon={faTrash}
                    />
                  </div>
                </div>,
              ];
            })
        ) : (
          <span style={{ fontSize: "0.8em", color: "#555", marginTop: 10 }}>
            ไม่มีรายการอาหารในหมวดหมู่นี้
          </span>
        )}
      </FoodList>
    );
  return "Loading";
}

function FoodAdd() {
  const { restaurant_id, category_id } = useParams();
  const imageRef = useRef();
  const fileRef = useRef();
  const history = useHistory();
  const [foodName, foodNameSet] = useState("");
  const [price, priceSet] = useState("");
  const [info, infoSet] = useState("");
  const [status, statusSet] = useState();

  function handleChange(target, setter) {
    setter(target.value);
  }

  function handleFoodNameChange({ target }) {
    handleChange(target, foodNameSet);
  }

  function handlePriceChange({ target }) {
    handleChange(target, priceSet);
  }

  function handleInfoChange({ target }) {
    handleChange(target, infoSet);
  }

  function handleImage({ target }) {
    const reader = new FileReader();

    reader.onload = (result) => {
      imageRef.current.src = result.target.result;
      imageRef.current.style = { display: "block" };
    };

    reader.readAsDataURL(target.files[0]);
  }

  async function handleSubmit(event) {
    event.preventDefault();

    const formData = new FormData();
    if (fileRef.current.files?.length > 0)
      formData.append("image", fileRef.current.files[0]);

    const json = await apiFetcher({
      url: `/manager/food/insert.php?name=${foodName}&category_id=${category_id}&price=${price}&user_uid=${Auth.currentUser.uid}&restaurant_id=${restaurant_id}&info=${info}`,
      option: {
        method: "POST",
        body: formData,
      },
    });

    if (json.message === "success") {
      history.push(
        "/manager/restaurant/" + restaurant_id + "/database/food/" + category_id
      );
    } else {
      statusSet(<span className="error">มีปัญหาในการเพิ่มอาหาร</span>);
    }
  }

  return (
    <form className={ManagerStyle.form + " form"} onSubmit={handleSubmit}>
      <big>เพิ่มอาหาร</big>
      <span>ชื่ออาหาร</span>
      <input
        placeholder="ชื่ออาหาร"
        value={foodName}
        onChange={handleFoodNameChange}
        type="text"
        required
      />
      <span>ราคา</span>
      <input
        placeholder="ราคา"
        value={price}
        onChange={handlePriceChange}
        type="text"
        required={true}
        pattern="\d*"
        title="เฉพาะตัวเลข 0-9 เท่านั้น"
      />
      <span>คำอธิบายอาหาร</span>
      <textarea
        placeholder="คำอธิบาย"
        value={info}
        onChange={handleInfoChange}
        required
      />
      <span>รูปอาหาร</span>
      <label className="fileForm">
        <input
          type="file"
          name="image"
          ref={fileRef}
          onChange={handleImage}
          accept="image/*"
        />
        <img src="#" style={{ display: "none" }} alt="food" ref={imageRef} />
      </label>
      <br />
      {status}
      <input type="submit" value="เพิ่มอาหาร" />
    </form>
  );
}

function FoodManageInterface() {
  const match = useRouteMatch();
  const [categoryShow, categoryShowSet] = useState(true);
  const [editCategory, editCategorySet] = useState(null);
  const [editingCategory, editingCategorySet] = useState(null);
  const { restaurant_id } = useParams();
  const { data, error, reload } = useAsync({
    promiseFn: apiFetcher,
    url: `/manager/category/list.php?restaurant_id=${restaurant_id}&user_uid=${Auth.currentUser.uid}`,
  });

  async function handleCreate() {
    const json = await apiFetcher({
      url: `/manager/category/insert.php?user_uid=${Auth.currentUser.uid}&restaurant_id=${restaurant_id}`,
    });

    if (json.message === "success") {
      reload();
    }
  }

  function handleEdit(id, value) {
    editCategorySet(id);
    editingCategorySet(value);
  }

  function handleEditing({ target }) {
    editingCategorySet(target.value);
  }

  async function handleDelete(id) {
    const con = window.confirm("ยืนยันการลบหมวดหมู่อาหาร ?");
    if (con) {
      const json = await apiFetcher({
        url: `/manager/category/delete.php?user_uid=${Auth.currentUser.uid}&restaurant_id=${restaurant_id}&id=${id}`,
      });

      if (json.message === "success") {
        reload();
      }
    }
  }

  async function handleSave() {
    if (editingCategory !== "") {
      const json = await apiFetcher({
        url: `/manager/category/update.php?id=${editCategory}&category_title=${editingCategory}&restaurant_id=${restaurant_id}&user_uid=${Auth.currentUser.uid}`,
      });

      editCategorySet(null);
      editingCategorySet("");

      if (json.message === "success") {
        reload();
      }
    }
    editCategorySet(null);
    editingCategorySet("");
  }

  function handleSort(result) {
    const reorder = async (list, startIndex, endIndex) => {
      const result = Array.from(list);
      const [removed] = result.splice(startIndex, 1);
      result.splice(endIndex, 0, removed);

      data.result = result;

      await apiFetcher({
        url: `/manager/category/sort.php?restaurant_id=${restaurant_id}&user_uid=${Auth.currentUser.uid}&start=${startIndex}&end=${endIndex}`,
      });
    };

    reorder(data.result, result.source.index, result.destination.index);
  }

  return (
    <Interface>
      <CategoryBar className="bar" show={categoryShow}>
        <div className="title">
          <span>หมวดหมู่</span>{" "}
          <FontAwesomeIcon
            onClick={() => categoryShowSet(false)}
            icon={faTimes}
          />
        </div>
        <div className="CategoryList">
          <DragDropContext onDragEnd={handleSort}>
            <Droppable droppableId="dropable">
              {(provided, snapshot) => (
                <div {...provided.droppableProps} ref={provided.innerRef}>
                  {data?.message === "success" && data.result
                    ? data.result.map((map, index) => (
                        <Draggable
                          key={map.id}
                          draggableId={map.id}
                          index={index}
                        >
                          {(provided, snapshot) => (
                            <NavLink
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                              ref={provided.innerRef}
                              style={{
                                userSelect: "none",
                                ...provided.draggableProps.style,
                              }}
                              activeClassName="selected"
                              className="CategoryMenu CategoryButton"
                              to={`${match.url}/${map.id}`}
                            >
                              {map.id === editCategory ? (
                                <input
                                  type="text"
                                  autoFocus={true}
                                  value={editingCategory}
                                  onChange={handleEditing}
                                  onBlur={handleSave}
                                  maxLength={30}
                                  onKeyPress={({ key }) => {
                                    if (key === "Enter") handleSave();
                                  }}
                                />
                              ) : (
                                <>
                                  <span>{map.category_title}</span>
                                  <span className="CategoryOperater">
                                    <FontAwesomeIcon
                                      onClick={() =>
                                        handleEdit(map.id, map.category_title)
                                      }
                                      icon={faPencilAlt}
                                    />
                                    <FontAwesomeIcon
                                      onClick={() => handleDelete(map.id)}
                                      icon={faTimes}
                                    />
                                    <FontAwesomeIcon icon={faBars} />
                                  </span>
                                </>
                              )}
                            </NavLink>
                          )}
                        </Draggable>
                      ))
                    : error && error}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </DragDropContext>
          <div className="CategoryButton" onClick={handleCreate}>
            สร้างหมวดหมู่ใหม่
          </div>
        </div>
      </CategoryBar>
      <FoodSection>
        <div className="title">
          <label>
            <FontAwesomeIcon
              icon={faEllipsisV}
              onClick={() => categoryShowSet(true)}
            />{" "}
            รายการอาหาร
          </label>
        </div>
        <div className="content">
          <Switch>
            <Route
              path={`${match.path}/:category_id/edit/:food_id`}
              component={FoodEdit}
            />
            <Route
              path={`${match.path}/:category_id/add`}
              component={FoodAdd}
            />
            <Route
              path={`${match.path}/:category_id`}
              component={FoodListContainer}
            />
            <Route path={`${match.path}`}>เลือกประเภทอาหาร</Route>
          </Switch>
        </div>
      </FoodSection>
    </Interface>
  );
}

function FoodManage() {
  const param = useParams();
  const { data, error } = useAsync({
    promiseFn: apiFetcher,
    url: `/manager/category/list.php?restaurant_id=${param.restaurant_id}&user_uid=${Auth.currentUser.uid}`,
  });

  if (error) return error;
  if (data) return <FoodManageInterface />;
  return "Loading";
}

export default FoodManage;
