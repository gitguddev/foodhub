import { lazy } from "react";

const RestaurantSelect = lazy(() => import("./RestaurantSelect"));
const RestaurantCreate = lazy(() => import("./RestaurantCreate"));
const Database = lazy(() => import("./Database"));

export { RestaurantCreate, RestaurantSelect, Database };
