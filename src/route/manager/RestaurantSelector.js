import React from "react";
import { useFetch } from "react-async";
import { Link, useRouteMatch } from "react-router-dom";
import ManagerStyle from "./Manager.module.css";
import { Auth } from "../../utils/firebase";

const API = "http://192.168.1.32/~littleboycoding/foodhub_api";

function RestaurantBox({ id, img, title, info }) {
  const match = useRouteMatch();

  return (
    <Link to={`/manager/restaurant/${id}`}>
      <div className={ManagerStyle.restaurantBox}>
        <img src={img} />
        <div>
          <big>{title}</big>
          <br />
          <small>{info}</small>
        </div>
      </div>
    </Link>
  );
}

function RestaurantSelector() {
  const { data, error } = useFetch(
    `${API}/restaurant/list.php?user_uid=${Auth.currentUser.uid}`,
    {
      headers: { accept: "application/json" },
    }
  );

  if (error) return error.message;
  if (data && data.message === "success") {
    return (
      <>
        {data.result ? (
          data.result.map((map) => (
            <RestaurantBox
              key={map.id}
              img="https://bk.asia-city.com/sites/default/files/styles/og_fb/public/chains.jpg?itok=gso4x7w1"
              title={map.name}
              id={map.id}
              info={map.info}
            />
          ))
        ) : (
          <div
            style={{
              textAlign: "center",
              fontSize: "5vw",
              color: "#666",
              padding: 10,
            }}
          >
            คุณยังไม่มีร้านค้า ลองเพิ่มสักร้านสิ !
          </div>
        )}
      </>
    );
  }
  return "Loading";
}

export default RestaurantSelector;
