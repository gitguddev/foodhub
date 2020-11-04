import React from "react";
import { ReactComponent as Food } from "./Popular Food.svg";
import { Link } from "react-router-dom";
import RestaurantStyle from "./Restaurant.module.css";

function Home() {
  return (
    <div className={RestaurantStyle.homeContainer}>
      <Food className={RestaurantStyle.popularFood} />
      <Link to="/catalog">
        <div className={RestaurantStyle.seeMore}>ดูเมนูทั้งหมด</div>
      </Link>
    </div>
  );
}

export default Home;
