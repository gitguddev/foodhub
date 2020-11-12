function apiFetcher({ url, option }) {
  const API = "http://192.168.1.32/~littleboycoding/foodhub_api";

  return fetch(`${API}${url}`, {
    ...option,
    headers: { Accept: "application/json" },
  })
    .then((res) => res.json())
    .catch((err) => ({ message: err }));
}

export default apiFetcher;
