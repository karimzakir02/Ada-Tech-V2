import React, { Component } from "react";
import {render} from "react-dom";

export class StatisticsOptions extends Component {

  constructor(props){
    super(props);

  };

  render() {
    return(
      <div id="statistics">
        <li style={{marginLeft: "15px", paddingTop: "15px"}}>
          <h4 class="white-text" style={{fontSize: "16pt"}}>stats</h4>
        </li>
      </div>
  )
  }
}

export default StatisticsOptions;
