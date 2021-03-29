import React, {
  Component
} from "react";
import {
  render
} from "react-dom";
import M from 'materialize-css'

export class AddColumn extends Component {

  constructor(props) {
    super(props);
    this.state = {
      notebook_id: this.props.id,
      select_dataset_value: null,
      input_new_column_name_value: "",
      input_formula_value: "",
    }
    this.prepareComponent = this.prepareComponent.bind(this);
    this.createDatasetSelect = this.createDatasetSelect.bind(this);
    this.handleSelectChange = this.handleSelectChange.bind(this);
    this.handleNewColumnNameChange = this.handleNewColumnNameChange.bind(this);
    this.handleFormulaChange = this.handleFormulaChange.bind(this);
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
    var select = document.getElementById("add_column_dataframe_select");
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

  handleSelectChange(event) {
    this.setState({
      select_dataset_value: event.target.value,
    })
    this.createColumnSelect(event.target.value);
  }

  handleNewColumnNameChange(event) {
    this.setState({
      input_new_column_name_value: event.target.value,
    })
  }

  handleFormulaChange(event) {
    this.setState({
      input_formula_value: event.target.value,
    })
  }

  handleClick() {
    const csrf = this.getCookie("csrftoken");
    let formData = new FormData();
    formData.append("id", this.state.notebook_id);
    formData.append("dataset", this.state.select_dataset_value);
    formData.append("new_column_name", this.state.input_new_column_name_value);
    formData.append("option", "custom");
    formData.append("expression", this.state.input_formula_value);
    const requestOptions = {
      method: "POST",
      headers: {csrf: csrf},
      body: formData,
    };
    fetch("/api/add-column", requestOptions)
    .then((response) => response.json())
    .then((data) => this.props.updateState(data))
  }

    render() {
      return(
          <li class="bold">
            <a onClick={this.prepareComponent} class="collapsible-header white-text"><span style={{marginLeft: "10px"}}>Add a New Column</span></a>
            <div class="collapsible-body">
                <div class="row" style={{paddingTop: "6%", marginBottom:0}}>
                  <div class="input-field col s12 m6">
                    <select id="add_column_dataframe_select" onChange={this.handleSelectChange}></select>
                    <label>Dataframe:</label>
                  </div>
                  <div class="input-field col s12 m6">
                    <input type="text" name="value" id="add_column_new_column_name_input" onChange={this.handleNewColumnNameChange} />
                    <label for="add_column_new_column_name_input">New Column Name:</label>
                  </div>
                  <div class="input-field col s12">
                    <input placeholder="col1 + col2" type="text" name="value" id="add_column_formula_input" onChange={this.handleFormulaChange} />
                    <label for="add_column_formula_input">Formula:</label>
                  </div>
                </div>
                <div class="divider"></div>
                <div class="section" style={{paddingTop: "4%"}}>
                  <button class="btn-flat modal-trigger" href="#add_column_modal">Options</button>
                  <button style={{marginLeft: "35%"}} onClick={this.handleClick} class="btn waves-effect waves-teal secondary-color" type="submit">Confirm</button>
                </div>
            </div>
          </li>
    )
  }
}

export default AddColumn;
