import React, {
  Component
} from "react";
import {
  render
} from "react-dom";
import M from 'materialize-css'

export class GroupByCalculations extends Component {

  constructor(props) {
    super(props);
    this.state = {
      notebook_id: this.props.id,
      select_dataset_value: null,
      select_column_value: null,
      select_calcualations_value: ["count"],
    }
    this.prepareComponent = this.prepareComponent.bind(this);
    this.createDatasetSelect = this.createDatasetSelect.bind(this);
    this.createColumnSelect = this.createColumnSelect.bind(this);
    this.handleDatasetChange = this.handleDatasetChange.bind(this);
    this.handleColumnSelectChange = this.handleColumnSelectChange.bind(this);
    this.handleCalculationsChange = this.handleCalculationsChange.bind(this);
    this.handleClick = this.handleClick.bind(this);
  };

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

  prepareComponent() {
    this.createDatasetSelect();
  }

  createDatasetSelect() {
    var select = document.getElementById("group_by_calculations_dataframe_select");
    select.innerHTML = "";
    for (var dataset of this.props.datasets) {
      select.options.add(new Option(dataset, dataset));
    }
    select.selectedIndex = 0;
    var select_value = select.value
    this.setState({
      select_dataset_value: select_value,
    });
    M.FormSelect.init(select);
    this.createColumnSelect(select.value);
  }

  createColumnSelect(select_value) {
    var select = document.getElementById("group_by_calculations_column_select");
    select.innerHTML = "";
    for (var column of this.props.columns[select_value]) {
      select.options.add(new Option(column, column));
    }
    this.setState({
      select_column_value: select.value,
    })
    M.FormSelect.init(select);
  }

  handleDatasetChange(event) {
    this.setState({
      select_dataset_value: event.target.value,
    })
    this.createColumnSelect(event.target.value);
  }

  handleColumnSelectChange(event) {
    this.setState({
      select_column_value: event.target.value,
    });
  }

  handleCalculationsChange(event) {
    var select = event.target;
    var selected = []
    for (var i=0; i<select.options.length; i++) {
      if (select.options[i].selected == true) {
        selected.push(select.options[i].value);
      }
    }
    this.setState({
      select_calcualations_value: selected,
    })
  }

  handleClick() {
    const csrf = this.getCookie("csrftoken");
    let formData = new FormData();
    formData.append("id", this.state.notebook_id);
    formData.append("dataset", this.state.select_dataset_value);
    formData.append("group_by_column", this.state.select_column_value);
    formData.append("calculations", JSON.stringify(this.state.select_calcualations_value));
    const requestOptions = {
      method: "POST",
      headers: {csrf: csrf},
      body: formData,
    };
    fetch("/api/group-by-calculations", requestOptions)
    .then((response) => response.json())
    .then((data) => this.props.updateState(data))
  }

    render() {
      return(
          <li class="bold">
            <a onClick={this.prepareComponent} class="collapsible-header white-text"><span style={{marginLeft: "10px"}}>Group By Calculations</span></a>
            <div class="collapsible-body">
                <div class="row" style={{paddingTop: "6%", marginBottom:0}}>
                  <div class="input-field col s12">
                    <select id="group_by_calculations_dataframe_select" onChange={this.handleDatasetChange}></select>
                    <label>Dataframe:</label>
                  </div>
                  <div class="input-field col s6">
                    <select id="group_by_calculations_column_select" onChange={this.handleColumnSelectChange}></select>
                    <label>Group By:</label>
                  </div>
                  <div class="input-field col s6">
                    <select multiple id="group_by_calculations_options_select" onChange={this.handleCalculationsChange}>
                      <option selected value="count">Count</option>
                      <option value="sum">Sum</option>
                      <option value="mean">Mean</option>
                      <option value="mad">Mean absolute Deviation</option>
                      <option value="min">Minimum</option>
                      <option value="max">Maximum</option>
                      <option value="mode">Mode</option>
                      <option value="prod">Product of Values</option>
                      <option value="std">Standard Deviation</option>
                      <option value="var">Variance</option>
                      <option value="sem">Standard Error of the Mean</option>
                      <option value="skew">Skewness</option>
                      <option value="kurt">Kurtosis</option>
                      <option value="cumsum">Cumulative product</option>
                      <option value="cummax">Cumulative maximum</option>
                      <option value="cummin">Cumilative Minimum</option>
                    </select>
                    <label for="group_by_calculations_options_select">Calculations</label>
                  </div>
                </div>
                <div class="divider"></div>
                <div class="section" style={{paddingTop: "4%"}}>
                  <button class="btn-flat modal-trigger" href="#group_by_calculations_modal">Options</button>
                  <button style={{marginLeft: "35%"}} onClick={this.handleClick} class="btn waves-effect waves-teal secondary-color" type="submit">Confirm</button>
                </div>
            </div>
          </li>
    )
  }
}

export default GroupByCalculations;
