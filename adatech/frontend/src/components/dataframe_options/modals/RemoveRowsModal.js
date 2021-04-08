import React, {
  Component
} from "react";
import {
  render
} from "react-dom";
import M from 'materialize-css'

export class RemoveRowsModal extends Component {

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
      select_option_value: "conditional",
      input_expression_value: "",
      checkbox_new_dataframe_value: false,
      input_new_dataframe_value: null,
    }
    this.prepareComponent = this.prepareComponent.bind(this);
    this.createDatasetSelect = this.createDatasetSelect.bind(this);
    this.handleDatasetChange = this.handleDatasetChange.bind(this);
    this.handleOptionChange = this.handleOptionChange.bind(this);
    this.handleExpressionChange = this.handleExpressionChange.bind(this);
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
    var select = document.getElementById("remove_rows_modal_dataframe_select");
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
    });
  }

  handleOptionChange(event) {
    this.setState({
      select_option_value: event.target.value,
    });
    var input = document.getElementById("remove_rows_modal_expression_input")
    if (event.target.value == "conditional") {
      input.placeholder = "(col1 == 'value') and (col2 > x)"
    }
    else {
      input.placeholder = "x:y"
    }
  }

  handleExpressionChange(event) {
    this.setState({
      input_expression_value: event.target.value,
    });
  }

  handleNewDataframeCheckboxChange(event) {
    var text_input = document.getElementById("remove_rows_modal_new_dataframe_input");
    if (event.target.checked) {
      text_input.disabled = false;
    }
    else {
      text_input.value = "";
      text_input.disabled = true;
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
    formData.append("expression", this.state.input_expression_value);
    formData.append("new_dataframe", JSON.stringify(this.state.checkbox_new_dataframe_value));
    formData.append("new_dataframe_value", this.state.input_new_dataframe_value);
    const requestOptions = {
      method: "POST",
      headers: {csrf: csrf},
      body: formData,
    };

    this.setState({
      count: 0,
    });

    fetch("/api/remove-rows", requestOptions)
    .then((response) => response.json())
    .then((data) => this.props.updateState(data))
  }

  handleOpen(e) {
    var modal = document.getElementById("remove_rows_modal");
    if ((e.target == modal) && (this.state.count == 0)){
      this.setState({
        count: 1,
      });
      this.prepareComponent();
    }
  }

  handleClose(e) {
    var modal = document.getElementById("remove_rows_modal");
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
        <div class="modal" id="remove_rows_modal" onFocus={this.handleOpen} onBlur={this.handleClose}>
          <div class="modal-content">
            <h4>Remove Rows</h4>
            <div class="divider"></div>
            <div class="row">
              <div class="col s6" style={{paddingTop: "5vh"}}>
                <div class="valign-wrapper modal-valign-wrapper">
                  <div class="card" style={{backgroundColor: "#0f3741"}}>
                    <div class="card-content white-text">
                      <p style={{fontSize:"12pt"}}>
                        Remove particular rows from your data based on a condition, the index, or row number<br /><br />
                        Choose how you would like to remove the rows and enter the condition or the start and end points
                        in the textbox<br /> <br />
                        By default, the chosen dataset will be modified directly. If you would like to create
                        a new dataset, check the appropriate box and enter the name for the new dataset.
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
                      <select id="remove_rows_modal_dataframe_select" onChange={this.handleDatasetChange}></select>
                      <label>Dataframe:</label>
                    </div>

                    <div class="input-field col s12 m6">
                      <select id="remove_rows_modal_option_select" onChange={this.handleOptionChange}>
                        <option selected value="conditional">Condition</option>
                        <option value="index">Index</option>
                      </select>
                      <label for="remove_rows_modal_option_select">Remove On</label>
                    </div>

                    <div class="input-field col s12 m6">
                      <input placeholder="(col1 == 'value') and (col2 > x)" type="text" id="remove_rows_modal_expression_input" onChange={this.handleExpressionChange} />
                      <label>Expression:</label>
                    </div>

                    <div class="col s12 m6">
                      <p>
                        <label>
                          <input id="remove_rows_modal_new_dataframe_checkbox" type="checkbox" onChange={this.handleNewDataframeCheckboxChange}/>
                          <span>New Dataframe</span>
                        </label>
                      </p>
                    </div>

                    <div class="input-field col s12 m6" style={{marginTop: 0}}>
                      <input id="remove_rows_modal_new_dataframe_input" disabled type="text" onChange={this.handleNewDataframeInputChange} />
                      <label class="active">Dataframe Name:</label>
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

export default RemoveRowsModal;
