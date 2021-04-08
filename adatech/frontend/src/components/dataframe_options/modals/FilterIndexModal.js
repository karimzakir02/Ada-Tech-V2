import React, {
  Component
} from "react";
import {
  render
} from "react-dom";
import M from 'materialize-css'

export class FilterIndexModal extends Component {

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
      input_filter_expression_value: "",
      select_filter_method_value: "loc",
      checkbox_new_dataframe_value: false,
      input_new_dataframe_value: null,
    }
    this.prepareComponent = this.prepareComponent.bind(this);
    this.createDatasetSelect = this.createDatasetSelect.bind(this);
    this.handleDatasetChange = this.handleDatasetChange.bind(this);
    this.handleFilterExpressionChange = this.handleFilterExpressionChange.bind(this);
    this.handleFilterByChange = this.handleFilterByChange.bind(this);
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
    var select = document.getElementById("filter_index_modal_dataframe_select");
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

  handleDatasetChange(event) {
    this.setState({
      select_dataset_value: event.target.value,
    });
    this.createColumnSelect(event.target.value);
  }

  handleFilterExpressionChange(event) {
    this.setState({
      input_filter_expression_value: event.target.value,
    })
  }

  handleFilterByChange(event) {
    this.setState({
      select_filter_method_value: event.target.value,
    })
  }

  handleNewDataframeCheckboxChange(event) {
    var text_inputs = document.getElementsByClassName("filter_index_modal_new_dataframe_input");
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
    formData.append("expression", this.state.input_filter_expression_value);
    formData.append("method", this.state.select_filter_method_value);
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

    fetch("/api/filter-index", requestOptions)
    .then((response) => response.json())
    .then((data) => this.props.updateState(data))
  }

  handleOpen(e) {
    var modal = document.getElementById("filter_index_modal");
    if ((e.target == modal) && (this.state.count == 0)){
      this.setState({
        count: 1,
      });
      this.prepareComponent();
    }
  }

  handleClose(e) {
    var modal = document.getElementById("filter_index_modal");
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
        <div class="modal" id="filter_index_modal" onFocus={this.handleOpen} onBlur={this.handleClose}>
          <div class="modal-content">
            <h4>Filter Using the Index/Rows</h4>
            <div class="divider"></div>
            <div class="row">
              <div class="col s6" style={{paddingTop: "5vh"}}>
                <div class="valign-wrapper modal-valign-wrapper">
                  <div class="card" style={{backgroundColor: "#0f3741"}}>
                    <div class="card-content white-text">
                      <p style={{fontSize:"12pt"}}>
                        Filter your data using its index or rows to get a slice of the data<br /><br />
                        Enter the start and end points for your query<br /> <br />
                        Choose whether you would like to filter using the index of the data or the rows<br /> <br />
                        By default, the filtered data is not saved. If you would like to save it for future use,
                        select the appropriate checkbox and enter the name for your new dataset
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
                      <select id="filter_index_modal_dataframe_select" onChange={this.handleDatasetChange}></select>
                      <label>Dataframe:</label>
                    </div>
                    <div class="input-field col s12 m6">
                      <input placeholder="x:y" type="text" id="filter_modal_expression_input" onChange={this.handleFilterExpressionChange} />
                      <label for="filter_modal_expression_input">Expression:</label>
                    </div>
                    <div class="input-field col s12 m6">
                      <select id="filter_index_modal_filter_by_select" onChange={this.handleFilterByChange}>
                        <option selected value="loc">Index</option>
                        <option value="iloc">Rows</option>
                      </select>
                      <label for="filter_index_modal_filter_by_select">Sort Using:</label>
                    </div>
                    <div class="col s12 m6" style={{paddingTop: "15px"}}>
                      <p>
                        <label>
                          <input id="filter_index_modal_new_dataframe_checkbox" type="checkbox" onChange={this.handleNewDataframeCheckboxChange}/>
                          <span>New Dataframe</span>
                        </label>
                      </p>
                    </div>
                    <div class="input-field col s12 m6">
                      <input disabled id="filter_index_modal_new_dataframe_input" class="filter_index_modal_new_dataframe_input" type="text" onChange={this.handleNewDataframeInputChange} />
                      <label class="active" for="filter_index_modal_new_dataframe_input">Dataframe Name:</label>
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

export default FilterIndexModal;
