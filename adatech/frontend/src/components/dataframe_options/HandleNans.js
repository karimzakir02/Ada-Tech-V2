import React, {
  Component
} from "react";
import {
  render
} from "react-dom";
import M from 'materialize-css'

export class HandleNans extends Component {

  constructor(props) {
    super(props);
    this.state = {
      notebook_id: this.props.id,
      select_dataset_value: null,
      select_columns_value: null,
      select_drop_by_value: "0",
    }
    this.prepareComponent = this.prepareComponent.bind(this);
    this.handleSelectChange = this.handleSelectChange.bind(this);
    this.handleColumnSelectChange = this.handleColumnSelectChange.bind(this);
    this.handleDropSelectChange = this.handleDropSelectChange.bind(this);
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
    var select = document.getElementById("handle_nans_select");
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
    var select = document.getElementById("handle_nans_column_select");
    var selected = []
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

  handleSelectChange(event) {
    this.setState({
      select_dataset_value: event.target.value,
    })
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
      select_columns_value: selected
    });
  }

  handleDropSelectChange(event) {
    console.log(event.target.value);
    this.setState({
      select_drop_by_value: event.target.value,
    })
  }

  handleClick() {
    const csrf = this.getCookie("csrftoken");
    let formData = new FormData();
    formData.append("id", this.state.notebook_id);
    formData.append("dataset", this.state.select_dataset_value);
    formData.append("columns", JSON.stringify(this.state.select_columns_value));
    formData.append("handle_nans_option", "drop")
    formData.append("drop_by", this.state.select_drop_by_value);
    formData.append("custom_symbol", JSON.stringify(false));
    formData.append("custom_symbol_value", "");
    formData.append("new_dataframe", JSON.stringify(false));
    formData.append("new_dataframe_value", "");
    const requestOptions = {
      method: "POST",
      headers: {csrf: csrf},
      body: formData,
    };
    fetch("/api/handle-nans", requestOptions)
    .then((response) => response.json())
    .then((data) => this.props.updateState(data))
  }

  // TODO: See if it would be possible to later set the value of the above input to 5

    render() {
      return(
          <li class="bold">
            <a onClick={this.prepareComponent} class="collapsible-header white-text"><span style={{marginLeft: "10px"}}>Handle Missing Values</span></a>
            <div class="collapsible-body">
                <div class="row" style={{paddingTop: "6%", marginBottom:0}}>
                  <div class="input-field col s12">
                    <select id="handle_nans_select" onChange={this.handleSelectChange}></select>
                    <label>Dataframe:</label>
                  </div>
                  <div class="input-field col s6">
                    <select multiple id="handle_nans_column_select" onChange={this.handleColumnSelectChange}></select>
                    <label>Columns:</label>
                  </div>
                  <div class="input-field col s6">
                    <select id="handle_nans_drop_select" onChange={this.handleDropSelectChange}>
                      <option selected value="0">Rows</option>
                      <option value="1">Columns</option>
                    </select>
                    <label for="handle_nans_drop_select">Drop Rows/Columns</label>
                  </div>
                </div>
                <div class="divider"></div>
                <div class="section" style={{paddingTop: "4%", paddingRight: "1%"}}>
                  <button class="btn-flat modal-trigger" href="#handle_nans_modal">Options</button>
                  <button style={{marginLeft: "32%"}} onClick={this.handleClick} class="btn waves-effect waves-teal secondary-color" type="submit">Confirm</button>
                </div>
            </div>
          </li>
    )
  }
}

export default HandleNans;
