import React, { Suspense, lazy } from "react";
import "./App.css";
import { BrowserRouter as Router, Switch, Route, Link } from "react-router-dom";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faHome,
  faShoppingCart,
  faScroll,
} from "@fortawesome/free-solid-svg-icons";

const Home = lazy(() => import("./home"));
const Cart = lazy(() => import("./cart"));
const Catalog = lazy(() => import("./catalog"));

function App() {
  return (
    <div className="App">
      <Router>
        <div className="container">
          <div className="header">
            <Switch>
              <Route path="/cart">ตระกร้า</Route>
              <Route path="/catalog">รายการ</Route>
              <Route path="/">หน้าแรก</Route>
            </Switch>
          </div>
          <div className="content">
            <Suspense fallback={<div>กำลังโหลด</div>}>
              <Switch>
                <Route path="/cart" component={Cart} />
                <Route path="/catalog" component={Catalog} />
                <Route path="/" component={Home} />
              </Switch>
            </Suspense>
          </div>
          <div className="navigator">
            <NavBT icon={faScroll} title="รายการ" url="/catalog" />
            <NavBT icon={faHome} title="หน้าแรก" url="/" />
            <NavBT icon={faShoppingCart} title="ตระกร้า" url="/cart" />
          </div>
        </div>
      </Router>
    </div>
  );
}

function NavBT({ icon, title, url }) {
  return (
    <Link to={url}>
      <div className="navBT">
        <FontAwesomeIcon icon={icon} />
        {title}
      </div>
    </Link>
  );
}

export default App;
