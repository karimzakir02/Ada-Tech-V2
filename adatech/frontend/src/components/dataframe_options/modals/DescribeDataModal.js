import React, {
  Component
} from "react";
import {
  render
} from "react-dom";
import M from 'materialize-css'

export class DescribeDataModal extends Component {

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
      select_columns_value: null,
      input_percentiles_value: null,
    }
    this.prepareComponent = this.prepareComponent.bind(this);
    this.createDatasetSelect = this.createDatasetSelect.bind(this);
    this.createColumnSelect = this.createColumnSelect.bind(this);
    this.handleDatasetChange = this.handleDatasetChange.bind(this);
    this.handleColumnSelectChange = this.handleColumnSelectChange.bind(this);
    this.handlePercentilesInputChange = this.handlePercentilesInputChange.bind(this);
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
    var select = document.getElementById("describe_data_modal_select");
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
    var select = document.getElementById("describe_data_modal_column_select");
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

  handleDatasetChange(event) {
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

  handlePercentilesInputChange(event) {
    this.setState({
      input_percentiles_value: event.target.value
    });
  }

  handleClick() {
    const csrf = this.getCookie("csrftoken");
    let formData = new FormData();
    formData.append("id", this.state.notebook_id);
    formData.append("dataset", this.state.select_dataset_value);
    formData.append("columns", JSON.stringify(this.state.select_columns_value));
    formData.append("percentiles", this.state.input_percentiles_value);
    const requestOptions = {
      method: "POST",
      headers: {csrf: csrf},
      body: formData,
    };
    this.setState({
      count: 0,
    });
    fetch("/api/describe-data", requestOptions)
    .then((response) => response.json())
    .then((data) => this.props.updateState(data))
  }

  handleOpen(e) {
    var modal = document.getElementById("describe_data_modal");
    if ((e.target == modal) && (this.state.count==0)){
      this.setState({
        count: 1,
      });
      this.prepareComponent();
    }
  }

  handleClose(e) {
    var modal = document.getElementById("describe_data_modal");
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
        <div class="modal modal-fixed-footer" id="describe_data_modal" onFocus={this.handleOpen} onBlur={this.handleClose}>
          <div class="modal-content">
            <h4>Describe Data</h4>
            <div class="divider"></div>
            <div class="row">
              <div class="col s6" style={{paddingTop: "5vh"}}>
                <div class="valign-wrapper modal-valign-wrapper">
                  <div class="card" style={{backgroundColor: "#0f3741"}}>
                    <div class="card-content white-text">
                      <p style={{fontSize:"12pt"}}>
                        Numerically describe your data to understand it better<br /><br />
                        Select the dataset and which columns you would like to statistically describe. By default, all numeric columns are selected<br /> <br />
                        You can enter custom percentiles to increase the detail of your analysis and the resulting table
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
                    <div class="input-field col s12 m6" id="describe_data_modal_select_field">
                      <select id="describe_data_modal_select" onChange={this.handleDatasetChange}></select>
                      <label>Dataframes:</label>
                    </div>
                    <div class="input-field col s12 m6">
                      <select multiple id="describe_data_modal_column_select" onChange={this.handleColumnSelectChange}></select>
                      <label>Numeric Columns:</label>
                    </div>
                    <div class="input-field col s12" id="describe_data_modal_input_field">
                      <input placeholder="0.33 0.66"id="describe_data_modal_input" type="text" onChange={this.handlePercentilesInputChange} />
                      <label class="active" for="describe_data_modal_input">Custom Percentiles:</label>
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

export default DescribeDataModal;
