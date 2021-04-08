import React, {
  Component
} from "react";
import {
  render
} from "react-dom";
import M from 'materialize-css'

export class GroupByCalculationsModal extends Component {

  // FIXME: The opening and the closing does not work as well as I want
  // The problem is that unless cancel is pressed explicitly, the handleClose
  // function is not run. Going to keep it this way for now, but it needs
  // to be fixed later on.

  constructor(props) {
    super(props);
    this.state = {
      count: 0,
      notebook_id: this.props.id,
      select_dataset_value: this.props.datasets[0],
      select_columns_value: this.props.datasets[0],
      select_group_by_column_value: null,
      select_calculations_value: ["count"],
      checkbox_new_dataframe_value: false,
      input_new_dataframe_value: null,
    }
    this.prepareComponent = this.prepareComponent.bind(this);
    this.createDatasetSelect = this.createDatasetSelect.bind(this);
    this.createColumnSelect = this.createColumnSelect.bind(this);
    this.createGroupByColumnSelect = this.createGroupByColumnSelect.bind(this);
    this.handleDatasetChange = this.handleDatasetChange.bind(this);
    this.handleColumnSelectChange = this.handleColumnSelectChange.bind(this);
    this.handleGroupByColumnSelectChange = this.handleGroupByColumnSelectChange.bind(this);
    this.handleCalculationsChange = this.handleCalculationsChange.bind(this);
    this.handleClick = this.handleClick.bind(this);
    this.handleOpen = this.handleOpen.bind(this);
    this.handleClose = this.handleClose.bind(this);
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
    var select = document.getElementById("group_by_calculations_modal_dataframe_select");
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
    this.createGroupByColumnSelect(select.value);
  }

  createColumnSelect(select_value) {
    var select = document.getElementById("group_by_calculations_modal_column_select");
    select.innerHTML = "";
    for (var column of this.props.columns[select_value]) {
      select.options.add(new Option(column, column));
    }
    for (var i=0; i < this.props.columns[select_value].length; i++){
      select.options[i].selected = true;
    }
    this.setState({
      select_columns_value: this.props.columns[select_value],
    });
    M.FormSelect.init(select);

  }

  createGroupByColumnSelect(select_value) {
    var select = document.getElementById("group_by_calculations_modal_group_by_column_select");
    select.innerHTML = "";
    for (var column of this.props.columns[select_value]) {
      select.options.add(new Option(column, column));
    }
    this.setState({
      select_group_by_column_value: select.value,
    });
    M.FormSelect.init(select);
  }

  handleDatasetChange(event) {
    this.setState({
      select_dataset_value: event.target.value,
    });
    this.createColumnSelect(event.target.value);
  }

  handleColumnSelectChange(event) {
    var select = event.target
    var selected = []
    for (var i=0; i<select.options.length; i++) {
      if (select.options[i].selected == true) {
        selected.push(select.options[i].value);
      }
    }
    this.setState({
      select_columns_value: selected,
    });
  }

  handleGroupByColumnSelectChange(event) {
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
      select_calculations_value: selected,
    });
  }


  handleClick() {
    const csrf = this.getCookie("csrftoken");
    let formData = new FormData();
    formData.append("id", this.state.notebook_id);
    formData.append("dataset", this.state.select_dataset_value);
    formData.append("columns", JSON.stringify(this.state.select_columns_value));
    formData.append("group_by_column", this.state.select_group_by_column_value);
    formData.append("calculations", JSON.stringify(this.state.select_calculations_value));
    const requestOptions = {
      method: "POST",
      headers: {csrf: csrf},
      body: formData,
    };

    this.setState({
      count: 0,
    });

    fetch("/api/group-by-calculations", requestOptions)
    .then((response) => response.json())
    .then((data) => this.props.updateState(data))
  }

  handleOpen(e) {
    var modal = document.getElementById("group_by_calculations_modal");
    if ((e.target == modal) && (this.state.count == 0)){
      this.setState({
        count: 1,
      });
      this.prepareComponent();
    }
  }

  handleClose(e) {
    var modal = document.getElementById("group_by_calculations_modal");
    if (modal == e.target) {
      if (modal.classList.contains("open") == false){
        this.setState({
          count: 0,
        });
      }
    }
  }

    render() {
      return(
        <div class="modal" id="group_by_calculations_modal" onFocus={this.handleOpen} onBlur={this.handleClose}>
          <div class="modal-content">
            <h4>Group By Calculations</h4>
            <div class="divider"></div>
            <div class="row">
              <div class="col s6" style={{paddingTop: "5vh"}}>
                <div class="valign-wrapper modal-valign-wrapper">
                  <div class="card" style={{backgroundColor: "#0f3741"}}>
                    <div class="card-content white-text">
                      <p style={{fontSize:"12pt"}}>
                        Get a statistical summary of your data based on particular column and groups<br /><br />
                        Select the columns to display and which column should be used to group the records<br /> <br />
                        Select one or multiple statistical measures you would like to see in your table to get
                        a detailed summary of your data
                      </p>
                    </div>
                    <div class="card-action">
                      <a href="#!">More Information</a>
                    </div>
                  </div>
                </div>
              </div>
              <div class="center col s6">
                <div class="valign-wrapper modal-valign-wrapper">
                  <div class="row" style={{paddingTop: "30%"}}>
                    <div class="input-field col s12 m6">
                      <select id="group_by_calculations_modal_dataframe_select" onChange={this.handleDatasetChange}></select>
                      <label>Dataframe:</label>
                    </div>
                    <div class="input-field col s12 m6">
                      <select multiple id="group_by_calculations_modal_column_select" onChange={this.handleColumnSelectChange}></select>
                      <label>Columns to Display:</label>
                    </div>
                    <div class="input-field col s12 m6">
                      <select id="group_by_calculations_modal_group_by_column_select" onChange={this.handleGroupByColumnSelectChange}></select>
                      <label>Group By:</label>
                    </div>
                    <div class="input-field col s12 m6">
                      <select multiple id="group_by_calculations_modal_options_select" onChange={this.handleCalculationsChange}>
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
                      <label for="group_by_calculations_modal_options_select">Calculations</label>
                    </div>
                  </div>
                  </div>
                </div>
              </div>
            </div>
          <div class="divider"></div>
          <div class="modal-footer">
            <a class="modal-close btn-flat">Cancel</a>
            <button onClick={this.handleClick} type="submit" class="modal-close waves-effect waves-teal btn secondary-color">Confirm</button>
          </div>
        </div>
    )
  }
}

export default GroupByCalculationsModal;
