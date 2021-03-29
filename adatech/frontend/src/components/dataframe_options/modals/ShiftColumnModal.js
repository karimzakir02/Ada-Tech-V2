import React, {
  Component
} from "react";
import {
  render
} from "react-dom";
import M from 'materialize-css'

export class ShiftColumnModal extends Component {

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
      select_column_value: null,
      input_shift_by_value: "last",
      checkbox_new_column_value: false,
      input_new_column_value: null,
    }
    this.prepareComponent = this.prepareComponent.bind(this);
    this.createDatasetSelect = this.createDatasetSelect.bind(this);
    this.createColumnSelect = this.createColumnSelect.bind(this);
    this.handleSelectChange = this.handleSelectChange.bind(this);
    this.handleColumnSelectChange = this.handleColumnSelectChange.bind(this);
    this.handleShiftByChange = this.handleShiftByChange.bind(this);
    this.handleNewColumnCheckboxChange = this.handleNewColumnCheckboxChange.bind(this);
    this.handleNewColumnInputChange = this.handleNewColumnInputChange.bind(this);
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
    var select = document.getElementById("shift_column_modal_dataframe_select");
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
    var select = document.getElementById("shift_column_modal_column_select");
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

  handleShiftByChange(event) {
    this.setState({
      input_shift_by_value: event.target.value,
    })
  }

  handleNewColumnCheckboxChange(event) {
    var text_inputs = document.getElementsByClassName("shift_column_modal_new_column_input");
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
      checkbox_new_column_value: event.target.checked,
      input_new_column_value: "",
    })
    M.updateTextFields();
  }

  handleNewColumnInputChange(event) {
    this.setState({
      input_new_column_value: event.target.value,
    })
  }

  handleClick() {
    const csrf = this.getCookie("csrftoken");
    let formData = new FormData();
    formData.append("id", this.state.notebook_id);
    formData.append("dataset", this.state.select_dataset_value);
    formData.append("column", this.state.select_column_value);
    formData.append("shift_by", this.state.input_shift_by_value);
    formData.append("new_column", JSON.stringify(this.state.checkbox_new_column_value));
    formData.append("new_column_name", this.state.input_new_column_value);
    const requestOptions = {
      method: "POST",
      headers: {csrf: csrf},
      body: formData,
    };
    fetch("/api/shift-column", requestOptions)
    .then((response) => response.json())
    .then((data) => this.props.updateState(data))
  }

  handleOpen(e) {
    var modal = document.getElementById("shift_column_modal");
    if ((e.target == modal) && (this.state.count == 0)){
      this.setState({
        count: 1,
      });
      this.prepareComponent();
    }
  }

  handleClose(e) {
    var modal = document.getElementById("shift_column_modal");
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
        <div class="modal" id="shift_column_modal" onFocus={this.handleOpen} onBlur={this.handleClose}>
          <div class="modal-content">
            <h4>Shift a Column</h4>
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
                    <div class="input-field col s12">
                      <select id="shift_column_modal_dataframe_select" onChange={this.handleSelectChange}></select>
                      <label>Dataframe:</label>
                    </div>

                    <div class="input-field col s12 m6">
                      <select id="shift_column_modal_column_select" onChange={this.handleColumnSelectChange}></select>
                      <label>Column to Shift:</label>
                    </div>

                    <div class="input-field col s12 m6">
                      <input placeholder="5" type="text" id="shift_column_modal_shift_by_input" onChange={this.handleShiftByChange} />
                      <label for="shift_column_modal_shift_by_input">Shift By:</label>
                    </div>

                    <div class="col s12 m6" style={{paddingTop: "15px"}}>
                      <p>
                        <label>
                          <input id="shift_column_modal_new_column_checkbox" type="checkbox" onChange={this.handleNewColumnCheckboxChange}/>
                          <span>New Column</span>
                        </label>
                      </p>
                    </div>

                    <div class="input-field col s12 m6">
                      <input disabled class="shift_column_modal_new_column_input" type="text" onChange={this.handleNewColumnInputChange} />
                      <label class="active" for="shift_column_modal_new_column_input">Column Name:</label>
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

export default ShiftColumnModal;
