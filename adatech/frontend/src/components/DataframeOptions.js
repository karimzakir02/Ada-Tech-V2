import React, { Component } from "react";
import {render} from "react-dom";
import RandomSamples from "./dataframe_options/RandomSamples"
import DescribeData from "./dataframe_options/DescribeData"
import UniqueValues from "./dataframe_options/UniqueValues"
import FindNans from "./dataframe_options/FindNans"
import HandleNans from "./dataframe_options/HandleNans"
import Sort from "./dataframe_options/Sort"
import Filter from "./dataframe_options/Filter"
import FilterIndex from "./dataframe_options/FilterIndex"
import GroupByCalculations from "./dataframe_options/GroupByCalculations"

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
          <RandomSamples id={this.props.id} datasets={this.props.datasets} updateState={this.props.updateState} columns={this.props.columns}/>
          <DescribeData id={this.props.id} datasets={this.props.datasets} updateState={this.props.updateState} columns={this.props.columns}/>
          <UniqueValues id={this.props.id} datasets={this.props.datasets} updateState={this.props.updateState} columns={this.props.columns}/>
          <FindNans id={this.props.id} datasets={this.props.datasets} updateState={this.props.updateState} columns={this.props.columns}/>
          <HandleNans id={this.props.id} datasets={this.props.datasets} updateState={this.props.updateState} columns={this.props.columns}/>
        </ul>
        <li style={{marginLeft: "15px"}}>
          <h4 class="white-text" style={{fontSize: "15pt", marginTop: "10px"}}>Sort & Filter</h4>
        </li>
        <ul class="collapsible collapsible-accordion">
          <Sort id={this.props.id} datasets={this.props.datasets} updateState={this.props.updateState} columns={this.props.columns}/>
          <Filter id={this.props.id} datasets={this.props.datasets} updateState={this.props.updateState} columns={this.props.columns}/>
          <FilterIndex id={this.props.id} datasets={this.props.datasets} updateState={this.props.updateState} columns={this.props.columns}/>
          <GroupByCalculations id={this.props.id} datasets={this.props.datasets} updateState={this.props.updateState} columns={this.props.columns}/>
        </ul>
      </div>
  )
  }
};

export default DataframeOptions;
