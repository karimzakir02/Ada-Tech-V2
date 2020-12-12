import React, { Component } from "react";
import {render} from "react-dom";

export class MachineLearningOptions extends Component {

  constructor(props){
    super(props);

  };

  render() {
    return(
      <div id="ml">
        <li style={{marginLeft: "15px", paddingTop: "15px"}}>
          <h4 class="white-text" style={{fontSize: "16pt"}}>ml</h4>
        </li>
      </div>
  )
  }
}

export default MachineLearningOptions;
