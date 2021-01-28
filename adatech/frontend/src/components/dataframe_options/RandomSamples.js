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
      dataframes: this.props.dataframes,
    }
    this.submitForm = this.submitForm.bind(this);
    this.prepareComponent = this.prepareComponent.bind(this);
  };

  async componentDidMount() {
    this.prepareComponent();
  }

  prepareComponent() {
    if (this.props.dataframes != this.state.dataframes) {
      this.setState({
        dataframes: this.props.dataframes,
      });
    }
    this.createSelect();

  }
  createSelect() {
    var select = document.createElement("select");
    var select_field = document.getElementById("random_samples_select");
    select_field.innerHTML = "";
    for (var dataframe of this.props.dataframes) {
      select.options.add(new Option(dataframe, dataframe));
    }
    select_field.appendChild(select);
    var label = document.createElement("label");
    label.innerHTML = "Dataframe";
    select_field.appendChild(label);
    M.FormSelect.init(select);
  }

  submitForm() {
    const csrf = this.getCookie("csrftoken");
    const requestOptions = {
      method: "POST",
      headers: {
        csrf: csrf
      },
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
                  <button style = {{backgroundColor: "#790604"}} class="btn right waves-effect waves-teal" name="sample_btn" type="submit">Confirm</button>
                </div>
                </div>
            </div>
          </li>
    )
  }
}

export default RandomSamples;
