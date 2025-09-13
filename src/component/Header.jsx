import { NavLink, useLoaderData, useLocation } from "react-router-dom";
import logo from "../assets/logo.png";
import "../style/header.css";
import { useSelector } from "react-redux";
import Widgets from "./Widgets";
function Header() {
  let isload = useSelector((store) => store.isLoaded.name)
  let location = useLocation()

  return (
    <>
      <header className="header">
        <div className="container">
          <div className="header__wrapper">
            <NavLink to="/">
              <img className="header__logo" src={logo} alt="" />
            </NavLink>

            <div className="header__account">
              <span>UK</span>
              <span>Uroljon Khidirboev</span>
            </div>
          </div>
        </div>
      </header>
      <Widgets />
    </>
  );
}

export default Header;
