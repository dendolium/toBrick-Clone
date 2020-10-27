import React from "react";
import { BrowserRouter as Router, Switch, Route } from "react-router-dom";
import App from "./App";
import Success from "./Success";

export default function Routes() {
  return (
    <Router>
      <Switch>
        <Route path="/" exact>
          <App />
        </Route>
        <Route path="/success/:instructions/:session_id/:date/:dimensions">
          <Success />
        </Route>
      </Switch>
    </Router>
  );
}
