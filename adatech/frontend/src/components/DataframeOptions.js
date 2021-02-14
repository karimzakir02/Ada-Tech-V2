import React, { Component } from "react";
import {render} from "react-dom";
import RandomSamples from "./dataframe_options/RandomSamples"

export class DataframeOptions extends Component {

  constructor(props){
    super(props);
    this.state = {
      dataframes: this.props.dataframes,
    }

  };

  render() {
    return(
      <div id="dataframe">
        <div class="section"></div>
        <li style={{marginLeft: "15px", paddingTop:"15px"}}>
          <h4 class="white-text" style={{fontSize: "15pt"}}>Data Summary</h4>
        </li>
        <ul class="collapsible collapsible-accordion">
          <RandomSamples id={this.props.id} dataframes={this.props.dataframes} func={this.props.func} columns={this.props.columns}/>
        </ul>
      </div>
  )
  }
};

export default DataframeOptions;
