import React, {
  Component
} from "react";
import {
  render
} from "react-dom";
import M from 'materialize-css'

export class AddColumnModal extends Component {

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
      input_new_column_name_value: "",
      select_option_value: "custom",
      select_column_value: null,
      input_expression_value: "",
    }
    this.prepareComponent = this.prepareComponent.bind(this);
    this.createDatasetSelect = this.createDatasetSelect.bind(this);
    this.createColumnSelect = this.createColumnSelect.bind(this);
    this.handleSelectChange = this.handleSelectChange.bind(this);
    this.handleNewColumnNameChange = this.handleNewColumnNameChange.bind(this);
    this.handleOptionChange = this.handleOptionChange.bind(this);
    this.handleColumnSelectChange = this.handleColumnSelectChange.bind(this);
    this.handleExpressionChange = this.handleExpressionChange.bind(this);
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
    var select = document.getElementById("add_column_modal_dataframe_select");
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
    var select = document.getElementById("add_column_modal_column_select");
    select.innerHTML = "";
    for (var column of this.props.columns[select_value]) {
      select.options.add(new Option(column, column));
    }
    this.setState({
      select_column_value: select.value,
    });
    M.FormSelect.init(select);
  }

  handleSelectChange(event) {
    this.setState({
      select_dataset_value: event.target.value,
    });
    this.createColumnSelect(event.target.value);
  }

  handleNewColumnNameChange(event) {
    this.setState({
      input_new_column_name_value: event.target.value,
    });
  }

  handleOptionChange(event) {
    this.setState({
      select_option_value: event.target.value,
    });
    var select = document.getElementById("add_column_modal_column_select");
    var input = document.getElementById("add_column_modal_formula_input");
    var label = document.getElementById("add_column_modal_formula_input_label");
    if (event.target.value == "custom") {
      select.disabled = true;
      input.placeholder = "col1 + col2";
      label.innerHTML = "Formula:"
    }
    else {
      select.disabled = false;
      input.placeholder = "10";
      label.innerHTML = "Roll By:"
    }
    M.FormSelect.init(select);
  }

  handleColumnSelectChange(event) {
    this.setState({
      select_column_value: event.target.value,
    });
  }

  handleExpressionChange(event) {
    this.setState({
      input_expression_value: event.target.value,
    })
  }

  handleClick() {
    const csrf = this.getCookie("csrftoken");
    let formData = new FormData();
    formData.append("id", this.state.notebook_id);
    formData.append("dataset", this.state.select_dataset_value);
    formData.append("new_column_name", this.state.input_new_column_name_value)
    formData.append("option", this.state.select_option_value);
    formData.append("column", this.state.select_column_value);
    formData.append("expression", this.state.input_expression_value);
    const requestOptions = {
      method: "POST",
      headers: {csrf: csrf},
      body: formData,
    };
    fetch("/api/add-column", requestOptions)
    .then((response) => response.json())
    .then((data) => this.props.updateState(data))
  }

  handleOpen(e) {
    var modal = document.getElementById("add_column_modal");
    if ((e.target == modal) && (this.state.count == 0)){
      this.setState({
        count: 1,
      });
      this.prepareComponent();
    }
  }

  handleClose(e) {
    var modal = document.getElementById("add_column_modal");
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
        <div class="modal" id="add_column_modal" onFocus={this.handleOpen} onBlur={this.handleClose}>
          <div class="modal-content">
            <h4>Add a Column</h4>
            <div class="divider"></div>
            <div class="row">
              <div class="col s6" style={{paddingTop: "5vh"}}>
                <div class="valign-wrapper modal-valign-wrapper">
                  <div class="card" style={{backgroundColor: "#0f3741"}}>
                    <div class="card-content white-text">
                      <p style={{fontSize:"12pt"}}>
                        Select the data to which you would like to add a new column <br /><br />
                        Enter the new column name and decide whether you would like to type a custom expression or using existing functions<br /> <br />
                        Enter the custom expression or decide on which column you would like to apply the exisitng functions to <br /> <br />
                        In case you are using existing functions, make sure to enter the correct parameters
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
                      <select id="add_column_modal_dataframe_select" onChange={this.handleSelectChange}></select>
                      <label>Dataframe:</label>
                    </div>

                    <div class="input-field col s12 m6">
                      <input type="text" name="value" id="add_column_modal_new_column_name_input" onChange={this.handleNewColumnNameChange} />
                      <label for="add_column_modal_new_column_name_input">Column Name:</label>
                    </div>

                    <div class="input-field col s12 m6">
                      <select id="add_column_modal_options_select" onChange={this.handleOptionChange}>
                        <option selected value="custom">Custom Function</option>
                        <option value="rolling_mean">Rolling Mean</option>
                        <option value="rolling_sum">Rolling Sum</option>
                      </select>
                      <label>Dataframe:</label>
                    </div>

                    <div class="input-field col s12 m6">
                      <select disabled id="add_column_modal_column_select" onChange={this.handleColumnSelectChange}></select>
                      <label for="add_column_modal_column_select">Column</label>
                    </div>


                    <div class="input-field col s12">
                      <input placeholder="col1 + col2" type="text" id="add_column_modal_formula_input" onChange={this.handleExpressionChange} />
                      <label for="add_column_modal_formula_input" id="add_column_modal_formula_input_label">Formula:</label>
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

export default AddColumnModal;
