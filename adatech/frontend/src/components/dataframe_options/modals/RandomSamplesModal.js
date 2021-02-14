import React, {
  Component
} from "react";
import {
  render
} from "react-dom";
import M from 'materialize-css'

export class RandomSamplesModal extends Component {

  // FIXME: The opening and the closing does not work as well as I want
  // The problem is that unless cancel is pressed explicitly, the handleClose
  // function is not run. Going to keep it this way for now, but it needs
  // to be fixed later on.

  constructor(props) {
    super(props);
    this.state = {
      count: 0,
      notebook_id: this.props.id,
      datasets: this.props.dataframes,
      columns: this.props.columns,
      select_dataset_value: this.props.dataframes[0],
      input_n_value: null,
      select_column_value: null,
      input_random_value: null,
    }
    this.prepareComponent = this.prepareComponent.bind(this);
    this.createDatasetSelect = this.createDatasetSelect.bind(this);
    this.createColumnSelect = this.createColumnSelect.bind(this);
    this.handleSelectChange = this.handleSelectChange.bind(this);
    this.handleInputChange = this.handleInputChange.bind(this);
    this.handleColumnSelectChange = this.handleColumnSelectChange.bind(this);
    this.handleRandomStateInputChange = this.handleRandomStateInputChange.bind(this);
    this.handleClick = this.handleClick.bind(this);
    this.handleOpen = this.handleOpen.bind(this);
    this.handleClose = this.handleClose.bind(this);
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
    this.createDatasetSelect();
    // this.createColumnSelect();
  }

  createDatasetSelect() {
    var select = document.getElementById("random_samples_modal_select");
    select.innerHTML = "";
    for (var dataframe of this.props.dataframes) {
      select.options.add(new Option(dataframe, dataframe));
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
    var select = document.getElementById("random_samples_modal_column_select");
    select.innerHTML = "";
    for (var column of this.props.columns[select_value]) {
      select.options.add(new Option(column, column));
    }
    for (var i=0; i < this.props.columns[select_value].length; i++){
      select.options[i].selected = true;
    }
    this.setState({
      select_column_value: this.props.columns[select_value],
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
      select_column_value: selected
    });
  }

  handleInputChange(event){
    this.setState({
      input_n_value: event.target.value
    });
  }

  handleRandomStateInputChange(event) {
    this.setState({
      input_random_value: event.target.value
    });
  }

  handleClick() {
    const csrf = this.getCookie("csrftoken");
    let formData = new FormData();
    formData.append("id", this.state.notebook_id);
    formData.append("dataset", this.state.select_dataset_value);
    formData.append("columns", JSON.stringify(this.state.select_column_value));
    formData.append("number", this.state.input_n_value);
    formData.append("random_state", this.state.input_random_value);
    const requestOptions = {
      method: "POST",
      headers: {csrf: csrf},
      body: formData,
    };
    fetch("/api/random-samples", requestOptions)
    .then((response) => response.json())
    .then((data) => this.props.func(data))
  }

  handleOpen(e) {
    var modal = document.getElementById("random_samples_modal");
    if ((e.target == modal) && (this.state.count==0)){
      this.setState({
        count: 1,
      });
      this.prepareComponent();
    }
  }

  handleClose(e) {
    var modal = document.getElementById("random_samples_modal");
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
        <div class="modal modal-fixed-footer" id="random_samples_modal" onFocus={this.handleOpen} onBlur={this.handleClose}>
          <div class="modal-content">
            <h4>Random Samples</h4>
            <div class="divider"></div>
            <div class="row">
              <div class="col s6" style={{paddingTop: "5vh"}}>
                <div class="valign-wrapper modal-valign-wrapper">
                  <div class="card" style={{backgroundColor: "#0f3741"}}>
                    <div class="card-content white-text">
                      <p style={{fontSize:"12pt"}}>
                        Select the data to sample <br /><br />
                        Enter the number of samples you would like to see, or enter a decimal to see a fraction of your data <br /> <br />
                        Choose specific columns to sample <br /><br />
                        Enter a random state to ensure reproducable results
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
                    <div class="input-field col s12 m6" id="random_samples_modal_select_field">
                      <select id="random_samples_modal_select" onChange={this.handleSelectChange}></select>
                      <label>Dataframes</label>
                    </div>
                    <div class="input-field col s12 m6">
                      <select multiple id="random_samples_modal_column_select" onChange={this.handleColumnSelectChange}></select>
                      <label>Columns</label>
                    </div>
                    <div class="input-field col s12 m6" id="random_samples_modal_input_field">
                      <input id="random_samples_modal_input" type="text" onChange={this.handleInputChange} />
                      <label class="active" for="random_samples_modal_input">Number of Samples:</label>
                    </div>
                    <div class="input-field col s12 m6">
                      <input id="random_samples_modal_random_state_input" type="text" onChange={this.handleRandomStateInputChange} />
                      <label class="active" for="random_samples_modal_random_state_input">Random State:</label>
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

export default RandomSamplesModal;
