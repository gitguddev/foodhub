function apiFetcher({ url, option }) {
  const API = "http://192.168.1.4/~littleboycoding/foodhub_api";

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

export default apiFetcher;
export { authedFetcher };
