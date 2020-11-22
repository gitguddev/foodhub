import React, { Suspense, lazy, useState } from "react";
import {
  faHome,
  faShoppingCart,
  faScroll,
  faSearch,
} from "@fortawesome/free-solid-svg-icons";
import RestaurantStyle from "./Restaurant.module.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Switch, Route, Link, useRouteMatch, Redirect } from "react-router-dom";
import Loader from "../../utils/Loader";
import styled, { keyframes } from "styled-components";
import { useUpdate } from "../../utils/socket.io";

const CatalogHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const SearchExpandAnimation = keyframes`
	from {
		width: 0%;
	}
	to {
		width: 50%;
	}
`;

const SearchInput = styled.input.attrs((props) => ({
  type: "text",
  placeholder: "ชื่ออาหาร",
  autoFocus: true,
}))`
  padding: 5px;
  width: 50%;
  border: 2px white solid;
  background-color: transparent;
  color: white;
  border-radius: 3px;
  margin-left: auto;
  animation: ${SearchExpandAnimation} 0.8s;
  position: absolute;
  right: 10px;
`;

const Home = lazy(() => import("./Home"));
const Cart = lazy(() => import("./Cart"));
const Catalog = lazy(() => import("./Catalog"));

function Restaurant() {
  const match = useRouteMatch();
  const [search, searchSet] = useState("");

  function handleSearchChange(event) {
    searchSet(event.target.value);
  }

  if (!window.localStorage.getItem("auth")) return <Redirect to="/" />;

  return (
    <div className={RestaurantStyle.container}>
      <div className={RestaurantStyle.header}>
        <Switch>
          <Route path={`${match.path}/cart`}>ตระกร้า</Route>
          <Route path={`${match.path}/catalog/search`}>
            <CatalogHeader>
              <span>ค้นหาอาหาร</span>
              <SearchInput value={search} onChange={handleSearchChange} />
            </CatalogHeader>
          </Route>
          <Route path={`${match.path}/catalog`}>
            <CatalogHeader>
              <span>รายการ</span>
              <Link
                style={{ color: "white" }}
                to={`${match.url}/catalog/search`}
              >
                <FontAwesomeIcon icon={faSearch} />
              </Link>
            </CatalogHeader>
          </Route>
          <Route path={`${match.path}`}>หน้าแรก</Route>
        </Switch>
      </div>
      <div className={RestaurantStyle.content}>
        <Suspense fallback={<Loader />}>
          <Switch>
            <Route path={`${match.path}/cart`} component={Cart} />
            <Route path={`${match.path}/catalog/search`}>
              <Catalog search={search} />
            </Route>
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
