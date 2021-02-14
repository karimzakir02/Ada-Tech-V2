import React, { Component } from "react";
import {render} from "react-dom";
import Navbar from "./Navbar";

export default class HomePage extends Component {

  constructor(props){
    super(props);
    this.handleButtonPressed = this.handleButtonPressed.bind(this);

  };


  handleButtonPressed() {
    const requestOptions = {
      method: "POST",
      headers: {"Content-Type": "application/json"},
    };
    fetch("/api/create-notebook", requestOptions)
    .then((response) => response.json())
    .then((data) => this.props.history.push("/notebook/" + data.id))
  }

  render() {
    return(
      <div>
        <Navbar/>
        <div class="row" style={{minHeight:"100%"}}>
        <div class="col s1"></div>
          <div class= "col s5">
            <div class="valign-wrapper">
              <div class="row">
                <div class="row">
                <h1 class = "header left" style = {{color: "#0f3741"}}>Use Machine Learning algorithms with <strong>zero code</strong></h1>
                </div>
                <div class = "row">
                <h5 class ="header light left">Use datas power to the fullest with Ada</h5>
                </div>
                <div class="row center">
                    <a onClick={this.handleButtonPressed} class="btn-large waves-effect waves-light primary-color">Get Started</a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
  )
  }
}
