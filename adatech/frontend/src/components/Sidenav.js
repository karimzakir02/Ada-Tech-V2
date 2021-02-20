import React, { Component } from "react";
import {render} from "react-dom";
import DataframeOptions from "./DataframeOptions";
import StatisticsOptions from "./StatisticsOptions";
import MachineLearningOptions from "./MachineLearningOptions";

export class Sidenav extends Component {
  constructor(props){
    super(props);
  }

  render() {
    return (
      <div>
        <ul id="slide-out" class="sidenav sidenav-fixed primary-color" style={{width: "20%"}}>
          <li class="logo">
            <h2 style = {{color: "white", textAlign: "center"}}>Ada Tech.</h2>
          </li>
          <div class = "row">
            <div class = "col s12">
              <ul class = "primary-color tabs" id="tabs">
                <li class = "tab col s4"><a href="#dataframe" style = {{color: "white"}}>Data</a></li>
                <li class = "tab col s4"><a href = "#statistics" style = {{color: "white"}}>Statistics</a></li>
                <li class = "tab col s4"><a href = "#ml" style = {{color: "white"}}>Models</a></li>
              </ul>
            </div>
            <DataframeOptions id={this.props.id} datasets={this.props.datasets} updateState={this.props.updateState} columns={this.props.columns}/>
            <StatisticsOptions />
            <MachineLearningOptions />
          </div>
        </ul>
      </div>
    );
  }
}

export default Sidenav;
