import React, { Component } from "react";
import {render} from "react-dom";
import Notebook from "./Notebook";
import HomePage from "./HomePage";
import Navbar from "./Navbar";
import {
  BrowserRouter as Router,
  Switch,
  Route,
  Link,
  Redirect} from "react-router-dom";

export default class ReactRouter extends Component {
  constructor(props){
    super(props);
  }

  render() {
    return (
      <Router>
        <Switch>
          <Route exact path="/" component={HomePage}/>
          <Route path="/notebook/:id" component={Notebook}/>
        </Switch>
      </Router>
    );
  }
}
