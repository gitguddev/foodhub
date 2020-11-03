import React, { Suspense, lazy } from "react";
import {
  faHome,
  faShoppingCart,
  faScroll,
} from "@fortawesome/free-solid-svg-icons";
import CustomerStyle from "./Customer.module.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Switch, Route, Link, useParams } from "react-router-dom";

const Home = lazy(() => import("./Home"));
const Cart = lazy(() => import("./Cart"));
const Catalog = lazy(() => import("./Catalog"));

function Customer() {
  const { restaurant_id } = useParams();
  console.log(restaurant_id);

  return (
    <div class={CustomerStyle.container}>
      <div className={CustomerStyle.header}>
        <Switch>
          <Route path="/restaurant/cart">ตระกร้า</Route>
          <Route path="/restaurant/catalog">รายการ</Route>
          <Route path="/restaurant">หน้าแรก</Route>
        </Switch>
      </div>
      <div className={CustomerStyle.content}>
        <Suspense fallback={<div>กำลังโหลด</div>}>
          <Switch>
            <Route path="/restaurant/cart" component={Cart} />
            <Route path="/restaurant/catalog" component={Catalog} />
            <Route path="/restaurant" component={Home} />
          </Switch>
        </Suspense>
      </div>
      <div className={CustomerStyle.navigator}>
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
      <div className={CustomerStyle.navBT}>
        <FontAwesomeIcon icon={icon} />
        {title}
      </div>
    </Link>
  );
}

export default Customer;
