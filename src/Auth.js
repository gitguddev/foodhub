import React from "react";
import apiFetcher from "./utils/apiFetcher";
import { useParams, Redirect } from "react-router-dom";
import { useAsync } from "react-async";

const storage = window.localStorage;

async function Auther({ restaurant_id, table_number }) {
  if (storage.getItem("auth")) {
    const json = await apiFetcher({
      url: `/manager/checkAuth.php?restaurant_id=${restaurant_id}&table_number=${table_number}`,
      option: {
        headers: {
          Authorization: "Bearer " + storage.getItem("auth"),
          Accept: "application/json",
        },
      },
    });

    if (json.message === "success") {
      return {
        restaurant_id: json.result.restaurant_id,
        table_number: json.result.table_number,
      };
    } else {
      throw new Error(json.message);
    }
  } else {
    const json = await apiFetcher({
      url: `/manager/auth.php?restaurant_id=${restaurant_id}&table_number=${table_number}`,
    });

    if (json.message === "success") {
      storage.setItem("auth", json.result);
      return { restaurant_id, table_number };
    } else {
      throw new Error(json.message);
    }
  }
}

function Auth() {
  const { restaurant_id, table_number } = useParams();

  const { data, error } = useAsync({
    promiseFn: Auther,
    restaurant_id,
    table_number,
  });

  if (error) return <span>{error.message}</span>;
  if (data)
    return (
      <Redirect to={`/restaurant/${data.restaurant_id}/${data.table_number}`} />
    );
  return "Authenticationing...";
}

export default Auth;
