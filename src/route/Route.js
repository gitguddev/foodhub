import { lazy } from "react";

const Manager = lazy(() => import("./manager/Manager"));
const Restaurant = lazy(() => import("./restaurant/Restaurant"));
const Bill = lazy(() => import("./restaurant/Bill"));

export { Manager, Restaurant, Bill };
