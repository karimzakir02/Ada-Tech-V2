import React, {
  Component
} from "react";
import {
  render
} from "react-dom";
import M from 'materialize-css'

export class RandomSamples extends Component {

  constructor(props) {
    super(props);
    this.state = {
      notebook_id: this.props.id,
      select_dataset_value: null,
      input_n_value: null,
    }
    this.prepareComponent = this.prepareComponent.bind(this);
    this.createDatasetSelect = this.createDatasetSelect.bind(this);
    this.handleDatasetChange = this.handleDatasetChange.bind(this);
    this.handleInputChange = this.handleInputChange.bind(this);
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
    this.createSelect();
  }

  createDatasetSelect() {
    var select = document.getElementById("random_samples_select");
    select.innerHTML = "";
    for (var dataset of this.props.datasets) {
      select.options.add(new Option(dataset, dataset));
    }
    select.options[0].selected = true;
    this.setState({
      select_dataset_value: select.options[0].value
    })
    M.FormSelect.init(select);
  }

  handleDatasetChange(event) {
    this.setState({
      select_dataset_value: event.target.value,
    })
  }

  handleInputChange(event){
    this.setState({
      input_n_value: event.target.value
    })
  }

  handleClick() {
    const csrf = this.getCookie("csrftoken");
    let formData = new FormData();
    formData.append("id", this.state.notebook_id);
    formData.append("dataset", this.state.select_dataset_value);
    formData.append("number", this.state.input_n_value);
    formData.append("columns", JSON.stringify(this.props.columns[this.state.select_dataset_value]));
    formData.append("random_state", null);
    const requestOptions = {
      method: "POST",
      headers: {csrf: csrf},
      body: formData,
    };
    fetch("/api/random-samples", requestOptions)
    .then((response) => response.json())
    .then((data) => this.props.updateState(data))
  }

  // TODO: See if it would be possible to later set the value of the above input to 5

    render() {
      return(
          <li class="bold">
            <a onClick={this.prepareComponent} class="collapsible-header white-text"><span style={{marginLeft: "10px"}}>Random Samples</span></a>
            <div class="collapsible-body">
                <div class="row" style={{paddingTop: "6%", marginBottom:0}}>
                  <div class="input-field col s6" id="random_samples_select_field">
                    <select id="random_samples_select" onChange={this.handleDatasetChange}></select>
                    <label>Dataframes</label>
                  </div>
                  <div class="input-field col s6" id="random_samples_input_field">
                    <input id="random_samples_input" type="text" onChange={this.handleInputChange} />
                    <label class="active" for="random_samples_input">Number of Samples:</label>
                  </div>
                </div>
                <div class="divider"></div>
                <div class="section" style={{paddingTop: "4%", paddingRight: "1%"}}>
                  <button class="btn-flat modal-trigger" href="#random_samples_modal">Options</button>
                  <button style={{marginLeft: "32%"}} onClick={this.handleClick} class="btn waves-effect waves-teal secondary-color" type="submit">Confirm</button>
                </div>
            </div>
          </li>
    )
  }
}

export default RandomSamples;
