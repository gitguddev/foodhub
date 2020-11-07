import React, { Suspense, lazy } from "react";
import {
  faHome,
  faShoppingCart,
  faScroll,
} from "@fortawesome/free-solid-svg-icons";
import RestaurantStyle from "./Restaurant.module.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Switch, Route, Link, useParams } from "react-router-dom";

const Home = lazy(() => import("./Home"));
const Cart = lazy(() => import("./Cart"));
const Catalog = lazy(() => import("./Catalog"));

function Restaurant() {
  const { restaurant_id } = useParams();

  return (
    <div class={RestaurantStyle.container}>
      <div className={RestaurantStyle.header}>
        <Switch>
          <Route path="/restaurant/cart">ตระกร้า</Route>
          <Route path="/restaurant/catalog">รายการ</Route>
          <Route path="/restaurant">หน้าแรก</Route>
        </Switch>
      </div>
      <div className={RestaurantStyle.content}>
        <Suspense fallback={<div>กำลังโหลด</div>}>
          <Switch>
            <Route path="/restaurant/cart" component={Cart} />
            <Route path="/restaurant/catalog" component={Catalog} />
            <Route path="/restaurant" component={Home} />
          </Switch>
        </Suspense>
      </div>
      <div className={RestaurantStyle.navigator}>
        <NavBT icon={faScroll} title="รายการ" url="/restaurant/catalog" />
        <NavBT icon={faHome} title="หน้าแรก" url="/restaurant/" />
        <NavBT icon={faShoppingCart} title="ตระกร้า" url="/restaurant/cart" />
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
