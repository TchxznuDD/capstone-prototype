import React from "react";
import ReactDOM from "react-dom";
import { BrowserRouter as Router, Switch, Route } from "react-router-dom";
import PrivateRoute from "./components/PrivateRoute";
import Computer from "./views/Computer";
import LoginPage from "./views/login-page";
import ServerStatus from "./views/ServerStatus";
import BackupManagement from "./views/BackupManagement";
import BackupHistory from "./views/BackupHistory";
import Settings from "./views/Settings";
import FirewallMonitor from "./views/FirewallMonitor";
import UserManual from "./views/UserManual";
import NotFound from "./views/not-found";
import { getDarkMode, applyDarkMode } from "./utils/theme";
import "./dark-mode.css";

// Apply dark mode on initial load
applyDarkMode(getDarkMode());

ReactDOM.render(
  <Router>
    <Switch>
      <Route exact path="/" component={LoginPage} />
      <PrivateRoute path="/computer" component={Computer} />
      <PrivateRoute path="/server-status" component={ServerStatus} />
      <PrivateRoute path="/backup/history" component={BackupHistory} />
      <PrivateRoute path="/backup" component={BackupManagement} />
      <PrivateRoute path="/settings" component={Settings} />
      <PrivateRoute path="/firewall/monitor" component={FirewallMonitor} />
      <PrivateRoute path="/user-manual" component={UserManual} />
      <Route component={NotFound} />
    </Switch>
  </Router>,
  document.getElementById("app")
);
