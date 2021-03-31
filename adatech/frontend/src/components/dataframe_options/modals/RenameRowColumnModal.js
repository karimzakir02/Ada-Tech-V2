import React, {
  Component
} from "react";
import {
  render
} from "react-dom";
import M from 'materialize-css'

export class RenameRowColumnModal extends Component {

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
      select_option_value: "0",
      multi_from_value: "",
      input_to_value: "",
      checkbox_new_dataframe_value: false,
      input_new_dataframe_value: null,
    }
    this.prepareComponent = this.prepareComponent.bind(this);
    this.createDatasetSelect = this.createDatasetSelect.bind(this);
    this.handleSelectChange = this.handleSelectChange.bind(this);
    this.handleOptionChange = this.handleOptionChange.bind(this);
    this.handleFromChange = this.handleFromChange.bind(this);
    this.handleToChange = this.handleToChange.bind(this);

    this.handleNewDataframeCheckboxChange = this.handleNewDataframeCheckboxChange.bind(this);
    this.handleNewDataframeInputChange = this.handleNewDataframeInputChange.bind(this);
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
    var select = document.getElementById("rename_row_column_modal_dataframe_select");
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


  handleSelectChange(event) {
    this.setState({
      select_dataset_value: event.target.value,
    });
  }

  handleOptionChange(event) {
    this.setState({
      select_option_value: event.target.value,
    });
    var field = document.getElementById("rename_row_column_modal_from_field");
    field.innerHTML = "";
    if (event.target.value == 0) {
      var input = document.createElement("input")
      input.type = "text"
      input.id = "rename_row_column_modal_to_input"
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
      })
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

  handleNewDataframeCheckboxChange(event) {
    var text_inputs = document.getElementsByClassName("rename_row_column_modal_new_dataframe_input");
    for (var text_input of text_inputs) {
      if (event.target.checked) {
        text_input.disabled = false;
      }
      else {
        text_input.value = "";
        text_input.disabled = true;
      }
    }
    this.setState({
      checkbox_new_dataframe_value: event.target.checked,
      input_new_dataframe_value: "",
    })
    M.updateTextFields();
  }

  handleNewDataframeInputChange(event) {
    this.setState({
      input_new_dataframe_value: event.target.value,
    })
  }

  handleClick() {
    const csrf = this.getCookie("csrftoken");
    let formData = new FormData();
    formData.append("id", this.state.notebook_id);
    formData.append("dataset", this.state.select_dataset_value);
    formData.append("option", this.state.select_option_value);
    formData.append("from", this.state.multi_from_value);
    formData.append("to", this.state.input_to_value);
    formData.append("new_dataframe", JSON.stringify(this.state.checkbox_new_dataframe_value));
    formData.append("new_dataframe_value", this.state.input_new_dataframe_value);
    const requestOptions = {
      method: "POST",
      headers: {csrf: csrf},
      body: formData,
    };
    fetch("/api/rename-row-column", requestOptions)
    .then((response) => response.json())
    .then((data) => this.props.updateState(data))
  }

  handleOpen(e) {
    var modal = document.getElementById("rename_row_column_modal");
    if ((e.target == modal) && (this.state.count == 0)){
      this.setState({
        count: 1,
      });
      this.prepareComponent();
    }
  }

  handleClose(e) {
    var modal = document.getElementById("rename_row_column_modal");
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
        <div class="modal" id="rename_row_column_modal" onFocus={this.handleOpen} onBlur={this.handleClose}>
          <div class="modal-content">
            <h4>Rename a Row/Column</h4>
            <div class="divider"></div>
            <div class="row">
              <div class="col s6" style={{paddingTop: "5vh"}}>
                <div class="valign-wrapper modal-valign-wrapper">
                  <div class="card" style={{backgroundColor: "#0f3741"}}>
                    <div class="card-content white-text">
                      <p style={{fontSize:"12pt"}}>
                        Select the data you would like to sort <br /><br />
                        Select the column by which you would like to sort your data <br /> <br />
                        Determine the sorting order of your data <br /> <br />
                        In case you would like your sorted data to be saved as a new dataframe,
                        click the appropriate checkbox and enter the name for your new dataframe
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
                    <select id="rename_row_column_modal_dataframe_select" onChange={this.handleDataframeChange}></select>
                    <label>Dataframe:</label>
                  </div>

                  <div class="input-field col s12 m6">
                    <select id="rename_row_column_modal_option_select" onChange={this.handleOptionChange}>
                      <option value="0" selected>Row</option>
                      <option value="1">Column</option>
                    </select>
                    <label for="rename_row_column_modal_option_select">Axis:</label>
                  </div>

                  <div class="input-field col s12 m6" id="rename_row_column_modal_from_field">
                    <input type="text" id="rename_row_column_modal_from_input" onChange={this.handleFromChange} />
                    <label for="rename_row_column_modal_from_input">From:</label>
                  </div>

                  <div class="input-field col s12 m6">
                    <input type="text" id="rename_row_column_modal_to_input" onChange={this.handleToChange} />
                    <label for="rename_row_column_modal_to_input">To:</label>
                  </div>


                    <div class="col s12 m6" style={{paddingTop: "15px"}}>
                      <p>
                        <label>
                          <input id="rename_row_column_modal_new_dataframe_checkbox" type="checkbox" onChange={this.handleNewDataframeCheckboxChange}/>
                          <span>New Dataframe</span>
                        </label>
                      </p>
                    </div>

                    <div class="input-field col s12 m6">
                      <input disabled class="rename_row_column_modal_new_dataframe_input" type="text" onChange={this.handleNewDataframeInputChange} />
                      <label class="active" for="rename_row_column_modal_new_dataframe_input">Dataframe Name:</label>
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

export default RenameRowColumnModal;
