import React, { Component } from "react";
import {render} from "react-dom";
import Sidenav from "./Sidenav";

export default class Notebook extends Component {
  constructor(props){
    super(props);
    this.state = {
      isAuthor: false,
      output: "",
    }
    this.id = this.props.match.params.id;
    this.getNotebookDetails();
  }

  getNotebookDetails() {
    fetch("/api/get-notebook" + "?id=" + this.id)
    .then((response) => response.json())
    .then((data) => {
      this.setState({
          isAuthor: data.is_author,
          output: data.output,
      })
    });
  }

  render() {
    return (
      <div>
        <Sidenav />
      </div>
    );
  }
}
