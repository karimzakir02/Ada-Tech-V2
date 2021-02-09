import React, { Component } from "react";
import {render} from "react-dom";

export default class Dataset extends Component {

  constructor(props){
    super(props);
    this.state = {
      id: this.props.match.params.id,
    };
    this.getDatasetDetails = this.getDatasetDetails.bind(this);
    this.getDatasetDetails();
  }

  getDatasetDetails() {
    fetch("/api/get-dataset" + "?id=" + this.state.id)
    .then((response) => response.json())
    .then((data) => this.displayData(data))
  }

  displayData(data) {
    var div = document.getElementById("table");
    var table_headings = data.columns;
    var table_rows = data.values;
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

  render() {
    return(
        <div id="table">

        </div>
    );
  }
}
