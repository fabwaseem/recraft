import React, { useEffect } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { Sidebar, Navbar, MobileNav } from "./components";
import useWindowSize from "./hooks/WindowSize.js";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const App = () => {
  const navigate = useNavigate();
   const location = useLocation();
  function checkTokenExpiration() {
    const accessToken = localStorage.getItem("accessToken");
    const accessTokenExpiresAt = localStorage.getItem("accessTokenExpiresAt");

    if (!accessToken || !accessTokenExpiresAt) {
      navigate("/settings?error=token"); // Redirect if no token
      return;
    }

    // Convert accessTokenExpiresAt (which is a string) to a number
    const expirationTime = new Date(accessTokenExpiresAt);

    const currentTime = new Date();
    if (currentTime > expirationTime) {
      localStorage.removeItem("accessToken");
      navigate("/settings?error=expire"); // Redirect if no token
      return;
    } else {
      return accessToken;
    }
  }
  useEffect(() => {
    const token = checkTokenExpiration();
  }, [location.pathname]);

  const windowSize = useWindowSize;
  return (
    <>
      <Navbar />
      {windowSize().width > 768 ? <Sidebar /> : <MobileNav />}
      <div
        className={` float-right  mt-14 min-h-[calc(100vh-5rem)] w-full bg-white pb-20 transition-all
         dark:bg-darkBg md:mt-20 md:w-[calc(100%-6rem)] md:pb-0
        `}
      >
        <ToastContainer
          position="bottom-right"
          autoClose={1000}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="colored"
        />
        <div className={`p-5 text-dark dark:text-white md:p-10`}>
          <Outlet />
        </div>
      </div>
    </>
  );
};

export default App;
