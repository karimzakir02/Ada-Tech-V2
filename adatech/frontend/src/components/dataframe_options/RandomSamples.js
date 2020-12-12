import React, { Component } from "react";
import {render} from "react-dom";

export class RandomSamples extends Component {

  constructor(props){
    super(props);

  };

  render() {
    return(
        <li class="bold">
          <a class="collapsible-header waves-effect waves-teal white-text"><span style={{marginLeft: "10px"}}>Random Samples</span></a>
          <div class="collapsible-body">
            <form method="POST" style = {{margin: 0, padding: 0}}>
              <div class="row" style={{paddingTop: "6%"}}>
                <div class="input-field col s6">
                  <select name="dataframe" class="dataframe_select">
                  </select>
                  <label>Data:</label>
                </div>
                <div class="input-field col s6">
                  <input value="5" id="n_samples" name="n_samples" type="text" />
                  <label>Number of Samples:</label>
                </div>
              <div class="divider"></div>
              <div class="section" style={{paddingRight: "2%"}}>
                <button class="btn-flat waves-effect waves-teal modal-trigger" href="#random_sample_modal">Advanced</button>
                <button style = {{backgroundColor: "#790604"}} class="btn right waves-effect waves-teal" name="sample_btn" type="submit">Confirm</button>
              </div>
              </div>
            </form>
          </div>
        </li>
  )
  }
}

export default RandomSamples;
