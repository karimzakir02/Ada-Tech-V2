import React, {
  Component
} from "react";
import {
  render
} from "react-dom";
import M from 'materialize-css'

export class SetResetIndex extends Component {

  constructor(props) {
    super(props);
    this.state = {
      notebook_id: this.props.id,
      select_dataset_value: null,
      select_column_value: null,
    }
    this.prepareComponent = this.prepareComponent.bind(this);
    this.createDatasetSelect = this.createDatasetSelect.bind(this);
    this.createColumnSelect = this.createColumnSelect.bind(this);
    this.handleDatasetChange = this.handleDatasetChange.bind(this);
    this.handleColumnSelectChange = this.handleColumnSelectChange.bind(this);
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
    var select = document.getElementById("set_reset_index_dataframe_select");
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
    var select = document.getElementById("set_reset_index_column_select");
    select.innerHTML = "";
    for (var column of this.props.columns[select_value]) {
      select.options.add(new Option(column, column));
    }
    this.setState({
      select_column_value: select.value,
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
    this.setState({
      select_column_value: event.target.value,
    });
  }

  handleClick() {
    const csrf = this.getCookie("csrftoken");
    let formData = new FormData();
    formData.append("id", this.state.notebook_id);
    formData.append("dataset", this.state.select_dataset_value);
    formData.append("column", this.state.select_column_value);
    formData.append("option", "set")
    formData.append("drop", JSON.stringify(true));
    formData.append("new_dataframe", JSON.stringify(false))
    formData.append("new_dataframe_value", JSON.stringify(""))
    const requestOptions = {
      method: "POST",
      headers: {csrf: csrf},
      body: formData,
    };
    fetch("/api/set-reset-index", requestOptions)
    .then((response) => response.json())
    .then((data) => this.props.updateState(data))
  }

  // TODO: See if it would be possible to later set the value of the above input to 5

    render() {
      return(
          <li class="bold">
            <a onClick={this.prepareComponent} class="collapsible-header white-text"><span style={{marginLeft: "10px"}}>Set/Reset the Index</span></a>
            <div class="collapsible-body">
                <div class="row" style={{paddingTop: "6%", marginBottom:0}}>

                  <div class="input-field col s6">
                    <select id="set_reset_index_dataframe_select" onChange={this.handleDatasetChange}></select>
                    <label>Dataframe:</label>
                  </div>

                  <div class="input-field col s6">
                    <select column id="set_reset_index_column_select" onChange={this.handleColumnSelectChange}></select>
                    <label>New Index:</label>
                  </div>
                </div>
                <div class="divider"></div>
                <div class="section" style={{paddingTop: "4%", paddingRight: "1%"}}>
                  <button class="btn-flat modal-trigger" href="#set_reset_index_modal">Options</button>
                  <button style={{marginLeft: "32%"}} onClick={this.handleClick} class="btn waves-effect waves-teal secondary-color" type="submit">Confirm</button>
                </div>
            </div>
          </li>
    )
  }
}

export default SetResetIndex;
