import React, { Component } from "react";
import {render} from "react-dom";
import RandomSamples from "./dataframe_options/RandomSamples"

export class DataframeOptions extends Component {

  constructor(props){
    super(props);

  };

  render() {
    return(
      <div id="dataframe">
        <div class="section"></div>
        <li style={{marginLeft: "15px", paddingTop:"15px"}}>
          <h4 class="white-text" style={{fontSize: "15pt"}}>Data Summary</h4>
        </li>

        <ul class="collapsible collapsible-accordion">
          <RandomSamples />
        </ul>
      </div>
  )
  }
};

export default DataframeOptions;
