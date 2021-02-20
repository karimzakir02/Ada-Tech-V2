import React, {
  Component
} from "react";
import {
  render
} from "react-dom";
import M from 'materialize-css'

export class FindNansModal extends Component {

  // FIXME: The opening and the closing does not work as well as I want
  // The problem is that unless cancel is pressed explicitly, the handleClose
  // function is not run. Going to keep it this way for now, but it needs
  // to be fixed later on.

  constructor(props) {
    super(props);
    this.state = {
      count: 0,
      notebook_id: this.props.id,
      columns: this.props.columns,
      select_dataset_value: this.props.datasets[0],
      select_columns_value: null,
      checkbox_custom_symbol_value: false,
      input_custom_symbol_value: null,
    }
    this.prepareComponent = this.prepareComponent.bind(this);
    this.createDatasetSelect = this.createDatasetSelect.bind(this);
    this.createColumnSelect = this.createColumnSelect.bind(this);
    this.handleSelectChange = this.handleSelectChange.bind(this);
    this.handleColumnSelectChange = this.handleColumnSelectChange.bind(this);
    this.handleCheckboxChange = this.handleCheckboxChange.bind(this);
    this.handleCustomSymbolInputChange = this.handleCustomSymbolInputChange.bind(this);
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
    var select = document.getElementById("find_nans_modal_select");
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
    var select = document.getElementById("find_nans_modal_column_select");
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
      select_columns_value: selected
    });
  }

  handleCheckboxChange(event) {
    var new_value;
    var text_input = document.getElementById("find_nans_modal_input");
    if (event.target.checked) {
      text_input.disabled = false;
    }
    else {
      text_input.value = "";
      text_input.disabled = true;
    }
    this.setState({
      checkbox_custom_symbol_value: event.target.checked,
    });
  }

  handleCustomSymbolInputChange(event) {
    this.setState({
      input_custom_symbol_value: event.target.value
    })
  }

  handleClick() {
    const csrf = this.getCookie("csrftoken");
    let formData = new FormData();
    formData.append("id", this.state.notebook_id);
    formData.append("dataset", this.state.select_dataset_value);
    formData.append("columns", JSON.stringify(this.state.select_columns_value));
    formData.append("custom_symbol", JSON.stringify(this.state.checkbox_custom_symbol_value));
    formData.append("custom_symbol_value", this.state.input_custom_symbol_value);
    const requestOptions = {
      method: "POST",
      headers: {csrf: csrf},
      body: formData,
    };
    fetch("/api/find-nans", requestOptions)
    .then((response) => response.json())
    .then((data) => this.props.updateState(data))
  }

  handleOpen(e) {
    var modal = document.getElementById("find_nans_modal");
    if ((e.target == modal) && (this.state.count == 0)){
      this.setState({
        count: 1,
      });
      this.prepareComponent();
    }
  }

  handleClose(e) {
    var modal = document.getElementById("find_nans_modal");
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
        <div class="modal modal-fixed-footer" id="find_nans_modal" onFocus={this.handleOpen} onBlur={this.handleClose}>
          <div class="modal-content">
            <h4>Find Missing Values</h4>
            <div class="divider"></div>
            <div class="row">
              <div class="col s6" style={{paddingTop: "5vh"}}>
                <div class="valign-wrapper modal-valign-wrapper">
                  <div class="card" style={{backgroundColor: "#0f3741"}}>
                    <div class="card-content white-text">
                      <p style={{fontSize:"12pt"}}>
                        Select the data <br /><br />
                        Select the column for which you would like to find missing values <br /> <br />
                        Check the checkbox if a custom symbol denotes the missing values (not NaN) <br /> <br />
                        Enter the custom symbol in the textbox
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
                  <div class="row" style={{paddingTop: "25%"}}>
                    <div class="input-field col s12">
                      <select id="find_nans_modal_select" onChange={this.handleSelectChange}></select>
                      <label>Dataframes:</label>
                    </div>
                    <div class="input-field col s12 m6">
                      <select multiple id="find_nans_modal_column_select" onChange={this.handleColumnSelectChange}></select>
                      <label>Columns:</label>
                    </div>
                    <div class="col s6" id="find_nans_checkbox_field" style={{paddingTop: "15px"}}>
                    <p>
                      <label>
                        <input type="checkbox" name="count_values" onChange={this.handleCheckboxChange}/>
                        <span>Custom Symbol</span>
                      </label>
                    </p>
                    </div>
                    <div class="input-field col s12">
                      <input disabled id="find_nans_modal_input" type="text" onChange={this.handleCustomSymbolInputChange} />
                      <label class="active" for="find_nans_modal_input">Custom Symbol Value:</label>
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

export default FindNansModal;
