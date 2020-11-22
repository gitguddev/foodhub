import React from "react";
import apiFetcher, { authedFetcher } from "./utils/apiFetcher";
import { useParams, Redirect, useHistory } from "react-router-dom";
import { useAsync } from "react-async";

const storage = window.localStorage;

async function Auther({ restaurant_id, table_number, history }) {
  if (storage.getItem("auth")) {
    const json = await authedFetcher({
      url: `/manager/checkAuth.php?restaurant_id=${restaurant_id}&table_number=${table_number}`,
    });

    switch (json.message) {
      case "success":
        return {
          restaurant_id: json.result.restaurant_id,
          table_number: json.result.table_number,
        };
      case "session ended":
        storage.removeItem("auth");
        alert("เซสชั่นหมดอายุแล้ว");
        throw new Error(json.message);
      case "token parse error":
        storage.removeItem("auth");
        alert("token ไม่ถูกต้อง");
        throw new Error(json.message);
      default:
        throw new Error(json.message);
    }
  } else {
    const json = await apiFetcher({
      url: `/manager/auth.php?restaurant_id=${restaurant_id}&table_number=${table_number}`,
    });

    switch (json.message) {
      case "success":
        storage.setItem("auth", json.result);
        return {
          restaurant_id,
          table_number,
        };
      case "already has session":
        alert("มีคนนั่งอยู่ที่โต๊ะนี้อยู่แล้ว");
        throw new Error(json.message);
      case "token encode error":
        storage.removeItem("auth");
        alert("เกิดข้อผิดพลาดในการเข้าสู่ระบบ");
        throw new Error(json.message);
      default:
        throw new Error(json.message);
    }
  }
}

function Auth() {
  const history = useHistory();
  const { restaurant_id, table_number } = useParams();

  const { data, error } = useAsync({
    promiseFn: Auther,
    restaurant_id,
    table_number,
    history,
  });

  if (error) return <Redirect to={`/error`} />;
  if (data) return <Redirect to={`/restaurant`} />;
  return "Authenticationing...";
}

export default Auth;
