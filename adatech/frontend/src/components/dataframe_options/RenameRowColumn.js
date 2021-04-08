import React, {
  Component
} from "react";
import {
  render
} from "react-dom";
import M from 'materialize-css'

export class RenameRowColumn extends Component {

  constructor(props) {
    super(props);
    this.state = {
      notebook_id: this.props.id,
      select_dataset_value: null,
      select_option_value: "0",
      multi_from_value: "",
      input_to_value: "",
    }
    this.prepareComponent = this.prepareComponent.bind(this);
    this.createDatasetSelect = this.createDatasetSelect.bind(this);
    this.handleDatasetChange = this.handleDatasetChange.bind(this);
    this.handleOptionChange = this.handleOptionChange.bind(this);
    this.handleFromChange = this.handleFromChange.bind(this);
    this.handleToChange = this.handleToChange.bind(this);

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
    var select = document.getElementById("rename_row_column_dataframe_select");
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
  }

  handleDatasetChange(event) {
    this.setState({
      select_dataset_value: event.target.value,
    })
    // this.createColumnSelect(event.target.value);
    if (this.state.select_option_value == "1") {
      var select = document.getElementById("rename_row_column_column_select");
      select.innerHTML = "";
      for (var column of this.props.columns[event.target.value]) {
        select.options.add(new Option(column, column));
      }
      select.selectedIndex = 0;
      M.FormSelect.init(select);
      var selected = select.value;
      this.setState({
        multi_from_value: selected,
      });
    };
  }


  handleOptionChange(event) {
    this.setState({
      select_option_value: event.target.value,
    });
    var field = document.getElementById("rename_row_column_from_field");
    field.innerHTML = "";
    if (event.target.value == 0) {
      var input = document.createElement("input")
      input.type = "text"
      input.id = "rename_row_column_to_input"
      var label = document.createElement("label")
      label.innerHTML = "From:"
      input.addEventListener("change", this.handleFromChange);
      field.appendChild(input)
      field.appendChild(label)
      this.setState({
        multi_from_value: "",
      });
    }
    else {
      var select = document.createElement("select");
      field.appendChild(select);
      select.id = "rename_row_column_column_select";
      var label = document.createElement("label");
      select.addEventListener("change", this.handleFromChange);
      label.innerHTML = "From:";
      field.appendChild(label);
      for (var column of this.props.columns[this.state.select_dataset_value]) {
        select.options.add(new Option(column, column));
      }
      M.FormSelect.init(select);
      var selected = select.value;
      this.setState({
        multi_from_value: selected,
      });
    }
  }

  handleFromChange(event) {
    this.setState({
      multi_from_value: event.target.value,
    });
  }

  handleToChange(event) {
    this.setState({
      input_to_value: event.target.value,
    });
  }


  handleClick() {
    const csrf = this.getCookie("csrftoken");
    let formData = new FormData();
    formData.append("id", this.state.notebook_id);
    formData.append("dataset", this.state.select_dataset_value);
    formData.append("option", this.state.select_option_value);
    formData.append("from", this.state.multi_from_value);
    formData.append("to", this.state.input_to_value);
    formData.append("new_dataframe", JSON.stringify(false));
    formData.append("new_dataframe_value", "");
    const requestOptions = {
      method: "POST",
      headers: {csrf: csrf},
      body: formData,
    };
    fetch("/api/rename-row-column", requestOptions)
    .then((response) => response.json())
    .then((data) => this.props.updateState(data))
  }

  // TODO: See if it would be possible to later set the value of the above input to 5

    render() {
      return(
          <li class="bold">
            <a onClick={this.prepareComponent} class="collapsible-header white-text"><span style={{marginLeft: "10px"}}>Rename Row/Column</span></a>
            <div class="collapsible-body">
                <div class="row" style={{paddingTop: "6%", marginBottom:0}}>
                  <div class="input-field col s12 m6">
                    <select id="rename_row_column_dataframe_select" onChange={this.handleDatasetChange}></select>
                    <label>Dataframe:</label>
                  </div>

                  <div class="input-field col s12 m6">
                    <select id="rename_row_column_option_select" onChange={this.handleOptionChange}>
                      <option value="0" selected>Row</option>
                      <option value="1">Column</option>
                    </select>
                    <label for="rename_row_column_option_select">Axis:</label>
                  </div>

                  <div class="input-field col s12 m6" id="rename_row_column_from_field">
                    <input type="text" id="rename_row_column_from_input" onChange={this.handleFromChange} />
                    <label for="rename_row_column_from_input">From:</label>
                  </div>

                  <div class="input-field col s12 m6">
                    <input type="text" id="rename_row_column_to_input" onChange={this.handleToChange} />
                    <label for="rename_row_column_to_input">To:</label>
                  </div>
                </div>
                <div class="divider"></div>
                <div class="section" style={{paddingTop: "4%"}}>
                  <button class="btn-flat modal-trigger" href="#rename_row_column_modal">Options</button>
                  <button style={{marginLeft: "35%"}} onClick={this.handleClick} class="btn waves-effect waves-teal secondary-color" type="submit">Confirm</button>
                </div>
            </div>
          </li>
    )
  }
}

export default RenameRowColumn;
