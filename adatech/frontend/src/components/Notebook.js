import React, { Component } from "react";
import {render} from "react-dom";
import Sidenav from "./Sidenav";
import RandomSamplesModal from "./dataframe_options/modals/RandomSamplesModal"
import DescribeDataModal from "./dataframe_options/modals/DescribeDataModal"
import UniqueValuesModal from "./dataframe_options/modals/UniqueValuesModal"
import FindNansModal from "./dataframe_options/modals/FindNansModal"
import HandleNansModal from "./dataframe_options/modals/HandleNansModal"
import SortModal from "./dataframe_options/modals/SortModal"
import FilterModal from "./dataframe_options/modals/FilterModal"
import FilterIndexModal from "./dataframe_options/modals/FilterIndexModal"
import GroupByCalculationsModal from "./dataframe_options/modals/GroupByCalculationsModal"
import AddColumnModal from "./dataframe_options/modals/AddColumnModal"
import RemoveColumnsModal from "./dataframe_options/modals/RemoveColumnsModal"
import ShiftColumnModal from "./dataframe_options/modals/ShiftColumnModal"
import SetResetIndexModal from "./dataframe_options/modals/SetResetIndexModal"
import CombineDataModal from "./dataframe_options/modals/CombineDataModal"

export default class Notebook extends Component {
  constructor(props){
    super(props);
    this.getNotebookDetails = this.getNotebookDetails.bind(this);
    this.uploadFile = this.uploadFile.bind(this);
    this.updateState = this.updateState.bind(this);
    this.state = {
      id: this.props.match.params.id,
      isAuthor: false,
      output: [],
      datasets: [],
      columns: [],
      numerical_columns: [],
    }
    this.id = this.props.match.params.id;
    this.getNotebookDetails();
  }

  getCookie(name) {
    var cookieValue = null;
    if (document.cookie && document.cookie !== '') {
        var cookies = document.cookie.split(';');
        for (var i = 0; i < cookies.length; i++) {
            var cookie = cookies[i].toString().replace(/^([\s]*)|([\s]*)$/g, "");
            if (cookie.substring(0, name.length + 1) === (name + '=')) {
                cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                break;
            }
        }
    }
    return cookieValue;
}

  getNotebookDetails() {
    fetch("/api/get-notebook" + "?id=" + this.id)
    .then((response) => response.json())
    .then((data) => this.updateState(data))
  }

  uploadFile(e) {
    let formData = new FormData();
    formData.append("file", event.target.files[0]);
    formData.append("id", this.state.id);

    const csrf = this.getCookie("csrftoken");
    const requestOptions = {
      method: "POST",
      headers: {csrf: csrf},
      body: formData,
    };
    fetch("/api/add-file", requestOptions)
      .then((response) => response.json())
      .then((data) => this.updateState(data))
  }

  updateState(data) {
    this.setState({
      output: data.output,
      datasets: data.dataset_names,
      columns: data.dataset_columns,
      numerical_columns: data.dataset_numerical_columns,
    });
    this.insertOutput(data);
  }

  // TODO: Don't forget to style your th tags, and other tags that need styling
  // Refer to the previous website version github.
  insertOutput(data) {
    var output_div = document.getElementById("output_div");
    output_div.innerHTML = "";
    if (this.state.output.length == 0){
      output_div.innerHTML = "Hey! Welcome to your notebook!";
      output_div.style.paddingLeft = "20%";
    }
    else {
      output_div.style.paddingLeft = 0;
      for (var output of this.state.output) {
        var div = document.createElement("div");
        div.className = "output section"
        if (output[0] == "table") {
          var table_data = output[1];
          var table_headings = table_data[0];
          var table_rows = table_data[1];
          var table = document.createElement("table");
          table.className = "striped";
          var thead = table.createTHead();
          var head_row = thead.insertRow();
          for (var heading of table_headings) {
            var th = document.createElement("th");
            var text = document.createTextNode(heading);
            th.style.fontSize = "10pt";
            th.style.padding = "8px";
            th.appendChild(text);
            head_row.appendChild(th);
          }
          var tbody = table.createTBody();
          for (var row_data of table_rows){
            var row = tbody.insertRow();
            for (var cell_data of row_data) {
              var cell = row.insertCell();
              cell.style.fontSize = "10pt";
              cell.style.padding = "8px";
              var text = document.createTextNode(cell_data);
              cell.appendChild(text);
              }
            }
          div.appendChild(table);
        }
        else if (output[0] == "text") {
          div.innerHTML = output[1];
        }
        output_div.appendChild(div);
        if (output[2] != null) {
          var link = document.createElement("a");
          // Need to make a proper link here!
          link.href = output[2];
          link.target = "_blank"
          link.textContent = "View Full Dataframe";
          link.style.fontSize = "12pt";
          link.className = "output";
          link.style.paddingTop = "0";
          output_div.appendChild(link);
          }
        }
      }
    }

  render() {
    return (
      <div>
        <Sidenav id={this.state.id} datasets={this.state.datasets} updateState={this.updateState} columns={this.state.columns}/>
        <div class="row" style={{padding: "10px", paddingLeft: "15%"}}>
          <div class="col s11" style={{padding: "10px"}}>
            <div class="container" id="output_div"></div>
          </div>
          <div class="col s1">
            <form class="pushpin-buttons pinned" method="POST" enctype = "multipart/form-data" style = {{marginLeft: "8px", paddingTop: "15px"}}>
              <button style = {{backgroundColor: "#790604"}} class = "btn-floating btn-file btn-large waves-effect waves-light" type = "submit">
                <input type="file" name="document" onChange={this.uploadFile} />
                <i class="material-icons">add</i>
              </button>
              <button style = {{backgroundColor: "#790604", marginTop: "20px"}} class = "btn-floating btn-file btn-large waves-effect waves-light" type = "submit">
                <i class="material-icons">add_chart</i>
              </button>
            </form>
          </div>
        </div>
        <RandomSamplesModal id={this.state.id} datasets={this.state.datasets} updateState={this.updateState} columns={this.state.columns}/>
        <DescribeDataModal id={this.state.id} datasets={this.state.datasets} updateState={this.updateState} columns={this.state.numerical_columns}/>
        <UniqueValuesModal id={this.state.id} datasets={this.state.datasets} updateState={this.updateState} columns={this.state.columns}/>
        <FindNansModal id={this.state.id} datasets={this.state.datasets} updateState={this.updateState} columns={this.state.columns}/>
        <HandleNansModal id={this.state.id} datasets={this.state.datasets} updateState={this.updateState} columns={this.state.columns} numerical_columns={this.state.numerical_columns}/>
        <SortModal id={this.state.id} datasets={this.state.datasets} updateState={this.updateState} columns={this.state.columns}/>
        <FilterModal id={this.state.id} datasets={this.state.datasets} updateState={this.updateState} columns={this.state.columns}/>
        <FilterIndexModal id={this.state.id} datasets={this.state.datasets} updateState={this.updateState} columns={this.state.columns}/>
        <GroupByCalculationsModal id={this.state.id} datasets={this.state.datasets} updateState={this.updateState} columns={this.state.columns}/>
        <AddColumnModal id={this.state.id} datasets={this.state.datasets} updateState={this.updateState} columns={this.state.numerical_columns}/>
        <RemoveColumnsModal id={this.state.id} datasets={this.state.datasets} updateState={this.updateState} columns={this.state.columns}/>
        <ShiftColumnModal id={this.state.id} datasets={this.state.datasets} updateState={this.updateState} columns={this.state.columns}/>
        <SetResetIndexModal id={this.state.id} datasets={this.state.datasets} updateState={this.updateState} columns={this.state.columns}/>
        <CombineDataModal id={this.state.id} datasets={this.state.datasets} updateState={this.updateState} columns={this.state.columns}/>
      </div>
    );
  }
}
