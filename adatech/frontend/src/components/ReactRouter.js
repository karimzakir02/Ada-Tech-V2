import React, { Component } from "react";
import {render} from "react-dom";
import NotebookPage from "./NotebookPage";
import HomePage from "./HomePage";
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
          <Route path="/notebook" component={NotebookPage}/>
        </Switch>
      </Router>
    );
  }
}
