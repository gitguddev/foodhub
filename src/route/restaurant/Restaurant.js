import React, {
  Suspense,
  lazy,
  useState,
  createContext,
  useEffect,
} from "react";
import {
  faHome,
  faShoppingCart,
  faScroll,
  faSearch,
} from "@fortawesome/free-solid-svg-icons";
import RestaurantStyle from "./Restaurant.module.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  Switch,
  Route,
  Link,
  useRouteMatch,
  Redirect,
  useHistory,
} from "react-router-dom";
import Loader from "../../utils/Loader";
import styled, { keyframes } from "styled-components";
import { createSocket } from "../../utils/socket.io";

import { authedFetcher } from "../../utils/apiFetcher";

const socket = createSocket(false);
const Socket = createContext();

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

const ConfirmMSG = styled.span`
  font-size: 1em;
  position: absolute;
  top: 53%;
  left: 50%;
  transform: translate(-50%);
`;

const Home = lazy(() => import("./Home"));
const Cart = lazy(() => import("./Cart"));
const Catalog = lazy(() => import("./Catalog"));

function Restaurant() {
  const match = useRouteMatch();
  const history = useHistory();
  const [search, searchSet] = useState("");
  const [connected, connectedSet] = useState(!!socket.connected);
  const [confirm, confirmSet] = useState(0);

  useEffect(() => {
    async function fetcher() {
      const json = await authedFetcher({
        url: `/restaurant/sessions/confirm.php`,
      });

      if (json?.message === "session ended") {
        alert("ถูกยกเลิกโดยทางร้านอาหาร");
        window.localStorage.removeItem("auth");
        window.location.href = "/";
      }

      if (json?.message === "success" && parseInt(json.result.confirm) === 1)
        confirmSet(1);
    }

    if (confirm === 0) {
      const timer = setInterval(fetcher, 1000);
      return () => clearInterval(timer);
    }
  });

  socket.on("connect", () => connectedSet(true));
  socket.on("disconnect", () => connectedSet(false));
  socket.on("connect_error", () => connectedSet(false));
  socket.on("completeBill", async (table_number) => {
    const json = await authedFetcher({
      url: `/restaurant/get_table_number.php`,
    });

    if (json?.message === "session ended") history.push(`/bill`);
  });

  function handleSearchChange(event) {
    searchSet(event.target.value);
  }

  if (!window.localStorage.getItem("auth")) return <Redirect to="/" />;

  if (confirm === 0)
    return (
      <>
        <Loader />
        <ConfirmMSG>รอการยืนยันจากทางร้าน</ConfirmMSG>
      </>
    );
  return connected ? (
    <Socket.Provider value={{ socket, connected }}>
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
    </Socket.Provider>
  ) : (
    <Loader />
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
export { Socket };
