import React from "react";
import { ReactComponent as Food } from "./Popular Food.svg";
import { Link } from "react-router-dom";
import CustomerStyle from "./Customer.module.css";

function Home() {
  return (
    <div className={CustomerStyle.homeContainer}>
      <Food className={CustomerStyle.popularFood} />
      <Link to="/catalog">
        <div className={CustomerStyle.seeMore}>ดูเมนูทั้งหมด</div>
      </Link>
    </div>
  );
}

export default Home;
