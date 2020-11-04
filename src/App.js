import React, { Suspense, lazy } from "react";
import "./App.css";
import { BrowserRouter as Router, Switch, Route } from "react-router-dom";

const Manager = lazy(() => import("./manager/Manager"));
const Restaurant = lazy(() => import("./restaurant/Restaurant"));

function App() {
  return (
    <div className="App">
      <Router>
        <Suspense fallback={"กำลังโหลด"}>
          <Switch>
            <Route path="/manager" component={Manager} />
            <Route path="/restaurant/:restaurant_id" component={Restaurant} />
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
