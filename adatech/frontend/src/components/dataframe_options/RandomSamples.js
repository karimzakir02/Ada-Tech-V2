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
      dataframes: this.props.dataframes,
      select_value: null,
      input_value: null,
    }
    this.prepareComponent = this.prepareComponent.bind(this);
    this.handleSelectChange = this.handleSelectChange.bind(this);
    this.handleInputChange = this.handleInputChange.bind(this);
    this.handleClick = this.handleClick.bind(this);
  };

  async componentDidMount() {
    this.prepareComponent();
    M.AutoInit();
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

  prepareComponent() {
    this.createSelect();
  }
  createSelect() {
    var select = document.getElementById("random_samples_select");
    select.innerHTML = "";
    for (var dataframe of this.props.dataframes) {
      select.options.add(new Option(dataframe, dataframe));
    }
    select.options[0].selected = true;
    this.setState({
      select_value: select.options[0].value
    })
    M.FormSelect.init(select);
  }

  handleSelectChange(event) {
    this.setState({
      select_value: event.target.value,
    })
  }

  handleInputChange(event){
    this.setState({
      input_value: event.target.value
    })
  }

  handleClick() {
    const csrf = this.getCookie("csrftoken");
    let formData = new FormData();
    console.log(this.state.select_value);
    formData.append("id", this.state.notebook_id);
    formData.append("dataset", this.state.select_value);
    formData.append("number", this.state.input_value);
    const requestOptions = {
      method: "POST",
      headers: {csrf: csrf},
      body: formData,
    };
    fetch("/api/random-samples", requestOptions)
    .then((response) => response.json())
    .then((data) => this.props.func(data))
  }

  // TODO: See if it would be possible to later set the value of the above input to 5

    render() {
      return(
          <li class="bold">
            <a onClick={this.prepareComponent} class="collapsible-header waves-effect waves-teal white-text"><span style={{marginLeft: "10px"}}>Random Samples</span></a>
            <div class="collapsible-body">
                <div class="row" style={{paddingTop: "6%"}}>
                  <div class="input-field col s6" id="random_samples_select_field">
                    <select id="random_samples_select" onChange={this.handleSelectChange}></select>
                    <label>Dataframes</label>
                  </div>
                  <div class="input-field col s6" id="random_samples_input_field">
                    <input id="random_samples_input" type="text" onChange={this.handleInputChange} />
                    <label class="active" for="random_samples_input">Number of Samples:</label>
                  </div>
                <div class="divider"></div>
                <div class="section" style={{paddingRight: "2%"}}>
                  <button class="btn-flat waves-effect waves-teal modal-trigger" href="#random_sample_modal">Advanced</button>
                  <button onClick={this.handleClick} style = {{backgroundColor: "#790604"}} class="btn right waves-effect waves-teal" name="sample_btn" type="submit">Confirm</button>
                </div>
                </div>
            </div>
          </li>
    )
  }
}

export default RandomSamples;
