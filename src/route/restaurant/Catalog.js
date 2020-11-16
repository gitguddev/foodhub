import React from "react";
import { useAsync } from "react-async";
import { authedFetcher } from "../../utils/apiFetcher";

function Catalog() {
  const { data, error } = useAsync({
    promiseFn: authedFetcher,
    url: `/restaurant/food/list.php`,
    onResolve(data) {
      console.log(data);
    },
  });

  if (error) return error;
  if (data) return "รายการ";
  return "Loading";
}

export default Catalog;
