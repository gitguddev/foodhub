import React from "react";
import { ReactComponent as Food } from "./Popular Food.svg";
import { Link } from "react-router-dom";

function Home() {
  return (
    <div className="homeContainer">
      <Food className="popularFood" />
      <Link to="/catalog">
        <div className="seeMore">ดูเมนูทั้งหมด</div>
      </Link>
    </div>
  );
}

export default Home;
