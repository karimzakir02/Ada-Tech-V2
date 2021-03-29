import React, {
  Component
} from "react";
import {
  render
} from "react-dom";
import M from 'materialize-css'

export class SetResetIndexModal extends Component {

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
      select_option_value: "set",
      select_column_value: null,
      checkbox_drop_value: true,
      checkbox_new_dataframe_value: false,
      input_new_dataframe_value: null,
    }
    this.prepareComponent = this.prepareComponent.bind(this);
    this.createDatasetSelect = this.createDatasetSelect.bind(this);
    this.createColumnSelect = this.createColumnSelect.bind(this);
    this.handleSelectChange = this.handleSelectChange.bind(this);
    this.handleColumnSelectChange = this.handleColumnSelectChange.bind(this);
    this.handleOptionChange = this.handleOptionChange.bind(this);
    this.handleDropCheckboxChange = this.handleDropCheckboxChange.bind(this);
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
    var option_selected = document.getElementById("set_reset_index_modal_option_select").value;
    var checkbox = document.getElementById("set_reset_index_drop_checkbox")
    if (option_selected == "set") {
      checkbox.checked = true;
    }
    else {
      checkbox.checked = false;
    }
  }

  createDatasetSelect() {
    var select = document.getElementById("set_reset_index_modal_dataframe_select");
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
    var select = document.getElementById("set_reset_index_modal_column_select");
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

  handleColumnSelectChange(event) {
    this.setState({
      select_column_value: event.target.value,
    });
  }

  handleOptionChange(event) {
    this.setState({
      select_option_value: event.target.value,
    });
    var column_select = document.getElementById("set_reset_index_modal_column_select");
    var checkbox = document.getElementById("set_reset_index_drop_checkbox");
    console.log(event.target.value);
    if (event.target.value == "set") {
      column_select.disabled = false;
      checkbox.checked = true;
    }
    else {
      column_select.disabled = true;
      checkbox.checked = false;
    }
    M.FormSelect.init(column_select);
    console.log(checkbox.checked);
    this.setState({
      checkbox_drop_value: checkbox.checked,
    });
  }

  handleDropCheckboxChange(event) {
    this.setState({
      checkbox_drop_value: event.target.checked,
    });
  }

  handleNewDataframeCheckboxChange(event) {
    var text_inputs = document.getElementsByClassName("set_reset_index_modal_new_dataframe_input");
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
    console.log(this.state.checkbox_drop_value);
    formData.append("id", this.state.notebook_id);
    formData.append("dataset", this.state.select_dataset_value);
    formData.append("option", this.state.select_option_value);
    formData.append("column", this.state.select_column_value);
    formData.append("drop", JSON.stringify(this.state.checkbox_drop_value));
    formData.append("new_dataframe", JSON.stringify(this.state.checkbox_new_dataframe_value));
    formData.append("new_dataframe_value", this.state.input_new_dataframe_value);
    const requestOptions = {
      method: "POST",
      headers: {csrf: csrf},
      body: formData,
    };
    fetch("/api/set-reset-index", requestOptions)
    .then((response) => response.json())
    .then((data) => this.props.updateState(data))
  }

  handleOpen(e) {
    var modal = document.getElementById("set_reset_index_modal");
    if ((e.target == modal) && (this.state.count == 0)){
      this.setState({
        count: 1,
      });
      this.prepareComponent();
    }
  }

  handleClose(e) {
    var modal = document.getElementById("set_reset_index_modal");
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
        <div class="modal" id="set_reset_index_modal" onFocus={this.handleOpen} onBlur={this.handleClose}>
          <div class="modal-content">
            <h4>Set/Reset the Index</h4>
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
                      <select id="set_reset_index_modal_dataframe_select" onChange={this.handleSelectChange}></select>
                      <label>Dataframe:</label>
                    </div>

                    <div class="input-field col s12 m6">
                      <select id="set_reset_index_modal_option_select" onChange={this.handleOptionChange}>
                        <option selected value="set">Set Index</option>
                        <option value="reset">Reset Index</option>
                      </select>
                      <label for="set_reset_index_modal_option_select">Sort Order</label>
                    </div>

                    <div class="input-field col s12 m6">
                      <select id="set_reset_index_modal_column_select" onChange={this.handleColumnSelectChange}></select>
                      <label>New Index:</label>
                    </div>

                    <div class="input-field col s12 m6" style={{paddingRight: "100px"}}>
                      <p>
                        <label>
                          <input id="set_reset_index_drop_checkbox" type="checkbox" onChange={this.handleDropCheckboxChange}/>
                          <span>Drop</span>
                        </label>
                      </p>
                    </div>


                    <div class="col s12 m6">
                      <p>
                        <label>
                          <input id="set_reset_index_modal_new_dataframe_checkbox" type="checkbox" onChange={this.handleNewDataframeCheckboxChange}/>
                          <span>New Dataframe</span>
                        </label>
                      </p>
                    </div>

                    <div class="input-field col s12 m6" style={{marginTop: 0}}>
                      <input disabled class="set_reset_index_modal_new_dataframe_input" type="text" onChange={this.handleNewDataframeInputChange} />
                      <label class="active" for="set_reset_index_modal_new_dataframe_input">Dataframe Name:</label>
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

export default SetResetIndexModal;
