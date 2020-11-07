import { lazy } from "react";

const Manager = lazy(() => import("./manager/Manager"));
const Restaurant = lazy(() => import("./restaurant/Restaurant"));

export { Manager, Restaurant };
