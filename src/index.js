import React from "react";
import ReactDOM from "react-dom";
import "./index.css";
import Routes from "./routes";

//importing bootstrap for all the components
import "bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.js";

ReactDOM.render(
  <React.StrictMode>
    <Routes />
  </React.StrictMode>,
  document.getElementById("root")
);
