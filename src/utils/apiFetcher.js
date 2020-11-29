import { useAsync } from "react-async";
import { useHistory } from "react-router-dom";
import { SERVER_ADDRESS } from "./config";

const SERVER = "http://" + SERVER_ADDRESS;

function apiFetcher({ url, option }) {
  const API = `${SERVER}/~littleboycoding/foodhub_api`;

  return fetch(`${API}${url}`, {
    headers: { Accept: "application/json" },
    ...option,
  })
    .then((res) => res.json())
    .catch((err) => ({ message: err }));
}

function authedFetcher({ url, option }) {
  return apiFetcher({
    url,
    option: {
      headers: {
        Authorization: "Bearer " + window.localStorage.getItem("auth"),
        Accept: "application/json",
      },
    },
  });
}

function useAuthAPI(url, option) {
  const history = useHistory();
  const result = useAsync({
    promiseFn: authedFetcher,
    url,
    ...option,
    onResolve(data) {
      switch (data.message) {
        case "session ended":
          // alert("เซสชั่นหมดอายุแล้ว");
          // window.localStorage.removeItem("auth");
          history.push("/bill");
          break;
        case "billing":
          history.push("/restaurant/cart/billing");
          break;
        case "token parse error":
          alert("token ไม่ถูกต้อง");
          window.localStorage.removeItem("auth");
          history.push("/error");
          break;
        case !"success":
          alert("เกิดข้อผิดพลาดขึ้น");
          history.push("/error");
          break;
        default:
          break;
      }
    },
  });

  return result;
}

export default apiFetcher;
export { authedFetcher, useAuthAPI };
