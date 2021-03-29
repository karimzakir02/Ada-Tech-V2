import React, {
  Component
} from "react";
import {
  render
} from "react-dom";
import M from 'materialize-css'

export class CombineData extends Component {

  constructor(props) {
    super(props);
    this.state = {
      notebook_id: this.props.id,
      select_left_dataset_value: null,
      select_right_dataset_value: null,
      select_option_value: "horizontal",
    }
    this.prepareComponent = this.prepareComponent.bind(this);
    this.createDatasetSelect = this.createDatasetSelect.bind(this);
    this.handleLeftDataframeChange = this.handleLeftDataframeChange.bind(this);
    this.handleRightDataframeChange = this.handleRightDataframeChange.bind(this);
    this.handleOptionChange = this.handleOptionChange.bind(this);
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
    var left_select = document.getElementById("combine_data_left_dataframe_select");
    left_select.innerHTML = "";
    for (var dataset of this.props.datasets) {
      left_select.options.add(new Option(dataset, dataset));
    }
    left_select.selectedIndex = 0;
    var left_select_value = left_select.value
    this.setState({
      select_left_dataset_value: left_select_value,
    });
    M.FormSelect.init(left_select);

    var right_select = document.getElementById("combine_data_right_dataframe_select");
    right_select.innerHTML = "";
    for (var dataset of this.props.datasets) {
      right_select.options.add(new Option(dataset, dataset));
    }
    if (this.props.datasets.length > 1) {
      right_select.selectedIndex = 1;
    }
    else {
      right_select.selectedIndex = 0;
    }
    var right_select_value = right_select.value
    this.setState({
      select_right_dataset_value: right_select_value,
    });
    M.FormSelect.init(right_select);
  }

  handleLeftDataframeChange(event) {
    this.setState({
      select_left_dataset_value: event.target.value,
    })
    this.createColumnSelect(event.target.value);
  }

  handleRightDataframeChange(event) {
    this.setState({
      select_right_dataset_value: event.target.value,
    });
  }

  handleOptionChange(event) {
    this.setState({
      select_option_value: event.target.value,
    })
  }

  handleClick() {
    const csrf = this.getCookie("csrftoken");
    let formData = new FormData();
    formData.append("id", this.state.notebook_id);
    formData.append("left_dataset", this.state.select_left_dataset_value);
    formData.append("right_dataset", this.state.select_right_dataset_value);
    formData.append("option", this.state.select_option_value);
    formData.append("new_dataframe", JSON.stringify(false));
    formData.append("new_dataframe_value", "");
    const requestOptions = {
      method: "POST",
      headers: {csrf: csrf},
      body: formData,
    };
    fetch("/api/combine-data", requestOptions)
    .then((response) => response.json())
    .then((data) => this.props.updateState(data))
  }

  // TODO: See if it would be possible to later set the value of the above input to 5

    render() {
      return(
          <li class="bold">
            <a onClick={this.prepareComponent} class="collapsible-header white-text"><span style={{marginLeft: "10px"}}>Combine Data</span></a>
            <div class="collapsible-body">
                <div class="row" style={{paddingTop: "6%", marginBottom:0}}>
                  <div class="input-field col s12 m6">
                    <select id="combine_data_left_dataframe_select" onChange={this.handleLeftDataframeChange}></select>
                    <label>Left Dataframe:</label>
                  </div>
                  <div class="input-field col s12 m6">
                    <select id="combine_data_right_dataframe_select" onChange={this.handleRightDataframeChange}></select>
                    <label>Right Dataframe:</label>
                  </div>
                  <div class="input-field col s12">
                    <select id="combine_data_option_select" onChange={this.handleOptionChange}>
                      <option selected value="horizontal">Horizontally</option>
                      <option value="vertical">Vertically</option>
                    </select>
                    <label for="combine_data_option_select">Combine</label>
                  </div>
                </div>
                <div class="divider"></div>
                <div class="section" style={{paddingTop: "4%"}}>
                  <button class="btn-flat modal-trigger" href="#combine_data_modal">Options</button>
                  <button style={{marginLeft: "35%"}} onClick={this.handleClick} class="btn waves-effect waves-teal secondary-color" type="submit">Confirm</button>
                </div>
            </div>
          </li>
    )
  }
}

export default CombineData;
