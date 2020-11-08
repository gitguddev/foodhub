import { lazy } from "react";

const RestaurantSelect = lazy(() => import("./RestaurantSelect"));
const RestaurantCreate = lazy(() => import("./RestaurantCreate"));

export { RestaurantCreate, RestaurantSelect };
