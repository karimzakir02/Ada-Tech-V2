import React, { Component } from "react";
import {render} from "react-dom";
import DataframeOptions from "./DataframeOptions";
import StatisticsOptions from "./StatisticsOptions";
import MachineLearningOptions from "./MachineLearningOptions";

export class Sidenav extends Component {
  constructor(props){
    super(props);
    this.state = {
      dataframes: this.props.dataframes,
    }
  }

  // componentWillReceiveProps(nextProps) {
  //     this.setState({
  //       dataframes: nextProps.dataframes,
  //     });
  //     console.log(this.state.dataframes);
  // }

  // TODO: Try doing the below (switching tabs) using JS purely,
  // so that you don't get that annoying fucking url change each time
  // Do it, by spotting clicks, determening where shit was clicked
  // and changing accordingly
  // Good React practice
  render() {
    return (
      <div>
        <ul id="slide-out" class="sidenav sidenav-fixed brand-color" style={{width: "20%"}}>
          <li class="logo">
            <h2 style = {{color: "white", textAlign: "center"}}>Ada Tech.</h2>
          </li>
          <div class = "row">
            <div class = "col s12">
              <ul class = "brand-color tabs" id="tabs">
                <li class = "tab col s4"><a href="#dataframe" style = {{color: "white"}}>Data</a></li>
                <li class = "tab col s4"><a href = "#statistics" style = {{color: "white"}}>Statistics</a></li>
                <li class = "tab col s4"><a href = "#ml" style = {{color: "white"}}>Models</a></li>
              </ul>
            </div>
            <DataframeOptions id={this.props.id} dataframes={this.props.dataframes} func={this.props.func} />
            <StatisticsOptions />
            <MachineLearningOptions />
          </div>
        </ul>
      </div>
    );
  }
}

export default Sidenav;
