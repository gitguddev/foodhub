import { lazy } from "react";

const RestaurantSelect = lazy(() => import("./RestaurantSelect"));
const RestaurantCreate = lazy(() => import("./RestaurantCreate"));
const RestaurantManage = lazy(() => import("./RestaurantManage"));
const Database = lazy(() => import("./Database"));

const FoodManage = lazy(() => import("./FoodManage"));

export {
  RestaurantCreate,
  RestaurantSelect,
  Database,
  RestaurantManage,
  FoodManage,
};
