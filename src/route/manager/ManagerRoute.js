import { lazy } from "react";

const RestaurantSelect = lazy(() => import("./RestaurantSelect"));
const RestaurantCreate = lazy(() => import("./RestaurantCreate"));
const RestaurantManage = lazy(() => import("./RestaurantManage"));
const Database = lazy(() => import("./Database"));

const FoodManage = lazy(() => import("./FoodManage"));
const WorkerManage = lazy(() => import("./WorkerManage"));
const OrderQueue = lazy(() => import("./OrderQueue"));
const Session = lazy(() => import("./Session"));
const Report = lazy(() => import("./Report"));

export {
  RestaurantCreate,
  RestaurantSelect,
  Database,
  RestaurantManage,
  WorkerManage,
  FoodManage,
  OrderQueue,
  Session,
  Report,
};
