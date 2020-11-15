import React from "react";
import { useAsync } from "react-async";
import { Link } from "react-router-dom";
import ManagerStyle from "./Manager.module.css";
import { Auth } from "../../utils/firebase";
import apiFetcher from "../../utils/apiFetcher";

function RestaurantBox({ id, img, title, info }) {
  return (
    <Link to={`/manager/restaurant/${id}`}>
      <div className={ManagerStyle.restaurantBox}>
        <img alt="restaurant thumbnail" src={img} />
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
  const { data, error } = useAsync({
    promiseFn: apiFetcher,
    url: `/manager/restaurant/list.php?user_uid=${Auth.currentUser.uid}`,
  });

  if (error) return error.message;
  if (data && data.message === "success") {
    return (
      <>
        {data.result ? (
          data.result.map((map) => (
            <RestaurantBox
              key={map.id}
              img={map.img}
              title={map.name}
              id={map.id}
              info={map.info}
            />
          ))
        ) : (
          <div
            style={{
              textAlign: "center",
              fontSize: "calc(9px + 2vw)",
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
