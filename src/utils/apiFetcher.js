function apiFetcher({ url }) {
  const API = "http://192.168.90.4/~littleboycoding/foodhub_api";

  return fetch(`${API}${url}`, {
    headers: { Accept: "application/json" },
  })
    .then((res) => res.json())
    .catch((err) => ({ message: err }));
}

export default apiFetcher;
