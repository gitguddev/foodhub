import React, { Suspense, lazy, useEffect, useState } from "react";
import {
  faHome,
  faShoppingCart,
  faScroll,
} from "@fortawesome/free-solid-svg-icons";
import RestaurantStyle from "./Restaurant.module.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Switch, Route, Link, useRouteMatch, Redirect } from "react-router-dom";

const Home = lazy(() => import("./Home"));
const Cart = lazy(() => import("./Cart"));
const Catalog = lazy(() => import("./Catalog"));

function Restaurant() {
  const match = useRouteMatch();

  if (!window.localStorage.getItem("auth")) return <Redirect to="/" />;

  return (
    <div className={RestaurantStyle.container}>
      <div className={RestaurantStyle.header}>
        <Switch>
          <Route path={`${match.path}/cart`}>ตระกร้า</Route>
          <Route path={`${match.path}/catalog`}>รายการ</Route>
          <Route path={`${match.path}`}>หน้าแรก</Route>
        </Switch>
      </div>
      <div className={RestaurantStyle.content}>
        <Suspense fallback={<div>กำลังโหลด</div>}>
          <Switch>
            <Route path={`${match.path}/cart`} component={Cart} />
            <Route path={`${match.path}/catalog`} component={Catalog} />
            <Route path={`${match.path}`} component={Home} />
          </Switch>
        </Suspense>
      </div>
      <div className={RestaurantStyle.navigator}>
        <NavBT icon={faScroll} title="รายการ" url={`${match.url}/catalog`} />
        <NavBT icon={faHome} title="หน้าแรก" url={`${match.url}`} />
        <NavBT
          icon={faShoppingCart}
          title="ตระกร้า"
          url={`${match.url}/cart`}
        />
      </div>
    </div>
  );
}

function NavBT({ icon, title, url }) {
  return (
    <Link to={url}>
      <div className={RestaurantStyle.navBT}>
        <FontAwesomeIcon icon={icon} />
        {title}
      </div>
    </Link>
  );
}

export default Restaurant;
