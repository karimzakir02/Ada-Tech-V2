import React, { Component } from "react";
import {render} from "react-dom";
import Sidenav from "./Sidenav";

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
      dataframes: [],
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
      dataframes: data.dataset_names,
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
      for (var output of this.state.output) {
        var div = document.createElement("div");
        div.className = "output"
        div.className += " section";
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
        output_div.appendChild(div);
        }
      }
    }

  // For future: pass the function parameters within the fetch url
  // you'll be able to handle that in the urls later

  render() {
    return (
      <div>
        <Sidenav dataframes={this.state.dataframes} func={this.updateState}/>
        <div class="row" style={{padding: "10px", paddingLeft: "15%"}}>
          <div class="col s11" style={{padding: "10px"}}>
            <div class="container" id = "output_div"></div>
          </div>
          <div class="col s1">
            <form class="pushpin-buttons pinned" method="POST" enctype = "multipart/form-data" style = {{marginLeft: "8px", paddingTop: "15px"}}>
              <button style = {{backgroundColor: "#790604"}} class = "btn-floating btn-file btn-large waves-effect waves-light" type = "submit">
                <input type="file" name="document" onChange={this.uploadFile} />
                <i class="material-icons">add</i>
              </button>
            </form>
          </div>
        </div>
      </div>
    );
  }
}
