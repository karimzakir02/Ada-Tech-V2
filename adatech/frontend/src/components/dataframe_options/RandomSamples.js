import React, { Component } from "react";
import {render} from "react-dom";

export class RandomSamples extends Component {

  constructor(props){
    super(props);
    this.state = {
      dataframes: this.props.dataframes,
    }
    // this.createSelect();
    this.submitForm = this.submitForm.bind(this);
    // this.changeSelectOptions();
    this.changeSelectOptions = this.changeSelectOptions.bind(this);
    this.call = this.call.bind(this);
    this.prepareComponent = this.prepareComponent.bind(this);
  };

  async componentDidMount() {
    if (this.props.dataframes != this.state.dataframes){
      this.setState({
        dataframes: this.props.dataframes,
      });
    }
    this.createSelect();
  }

  prepareComponent() {
    if (this.props.dataframes != this.state.dataframes){
      this.setState({
        dataframes: this.props.dataframes,
      });
    }
    console.log(this.state.dataframes);
    this.createSelect();
  }
  createSelect() {
    var select = document.createElement("select");
    var select_field = document.getElementById("random_samples_select")
    for (var dataframe of this.state.dataframes){
      console.log(dataframe);
      select.options.add(new Option(dataframe, dataframe));
    }
    console.log(select);
    select_field.appendChild(select);
    var label = document.createElement("label");
    label.innerHTML = "Dataframe";
    select_field.appendChild(label);
    select_field.formSelect();
    }
  changeSelectOptions() {
    // this.createSelect();
    // var select = document.getElementById("random_samples_dataframe");
    // console.log(select);
    // for (var dataframe of this.state.dataframes) {
    //   select.options.add(new Option(dataframe, dataframe));
    // }
  }

  submitForm() {
    const csrf = this.getCookie("csrftoken");
    const requestOptions = {
      method: "POST",
      headers: {csrf: csrf},
    };
    fetch("/api/random-samples", requestOptions)
    .then((response) => response.json())
    .then((data) => console.log(data))
  }

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

call(){
  console.log(this.props.dataframes);
  console.log(this.state.dataframes);
}
//What if I constructed when Random Samples got?

  render() {
    return(
        <li class="bold">
          <a onClick={this.prepareComponent} class="collapsible-header waves-effect waves-teal white-text"><span style={{marginLeft: "10px"}}>Random Samples</span></a>
          <div class="collapsible-body">
              <div class="row" style={{paddingTop: "6%"}}>
                <div class="input-field col s6" id="random_samples_select"></div>
                <div class="input-field col s6">
                  <input value="5" id="n_samples" name="n_samples" type="text" />
                  <label>Number of Samples:</label>
                </div>
              <div class="divider"></div>
              <div class="section" style={{paddingRight: "2%"}}>
                <button class="btn-flat waves-effect waves-teal modal-trigger" href="#random_sample_modal">Advanced</button>
                <button style = {{backgroundColor: "#790604"}} class="btn right waves-effect waves-teal" name="sample_btn" type="submit" onClick={this.call}>Confirm</button>
              </div>
              </div>
          </div>
        </li>
  )
  }
}

export default RandomSamples;
