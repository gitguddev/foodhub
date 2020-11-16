import React, { Suspense } from "react";
import "./App.css";
import { BrowserRouter as Router, Switch, Route } from "react-router-dom";

import { Restaurant, Manager } from "./route/Route";
import Auth from "./Auth";

function App() {
  return (
    <div className="App">
      <Router>
        <Suspense fallback={"กำลังโหลด"}>
          <Switch>
            <Route path="/manager" component={Manager} />
            <Route
              path="/restaurant/:restaurant_id/:table_number/auth"
              component={Auth}
            />
            <Route path="/restaurant" component={Restaurant} />
            <Route path="/getting-started">
              <div>Getting Started</div>
            </Route>
            <Route path="/">
              <div>Landing Page</div>
            </Route>
          </Switch>
        </Suspense>
      </Router>
    </div>
  );
}

export default App;
