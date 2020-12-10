import React, { Suspense } from "react";
import "./App.css";
import { BrowserRouter as Router, Switch, Route } from "react-router-dom";

import { Restaurant, Manager, Bill, Landing } from "./route/Route";
import Auth from "./Auth";
import Loader from "./utils/Loader";

function App() {
  return (
    <div className="App">
      <Router>
        <Suspense fallback={<Loader />}>
          <Switch>
            <Route path="/manager" component={Manager} />
            <Route
              path="/restaurant/auth/:restaurant_id/:table_number"
              component={Auth}
            />
            <Route path="/restaurant" component={Restaurant} />
            <Route path="/bill" component={Bill} />
            <Route path="/getting-started">
              <div>Getting Started</div>
            </Route>
            <Route path="/">
              <Landing />
            </Route>
          </Switch>
        </Suspense>
      </Router>
    </div>
  );
}

export default App;
