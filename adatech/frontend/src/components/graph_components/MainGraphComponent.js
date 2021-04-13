import React, {
  Component
} from "react";
import {
  render
} from "react-dom";
import M from 'materialize-css'

export class MainGraphComponent extends Component {

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
      input_n_value: null,
      input_random_state_value: null,
    }

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

  handleClick() {
    const csrf = this.getCookie("csrftoken");
    let formData = new FormData();
    formData.append("id", this.state.notebook_id);
    formData.append("dataset", this.state.select_dataset_value);
    formData.append("columns", JSON.stringify(this.state.select_columns_value));
    formData.append("number", this.state.input_n_value);
    formData.append("random_state", this.state.input_random_state_value);
    const requestOptions = {
      method: "POST",
      headers: {csrf: csrf},
      body: formData,
    };

    this.setState({
      count: 0,
    });

    fetch("/api/random-samples", requestOptions)
    .then((response) => response.json())
    .then((data) => this.props.updateState(data))
  }

  handleOpen(e) {
    var modal = document.getElementById("data_viz_modal");
    if ((e.target == modal) && (this.state.count==0)){
      this.setState({
        count: 1,
      });
      this.prepareComponent();
    }
  }

  handleClose(e) {
    var modal = document.getElementById("data_viz_modal");
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
        <div class="modal" id="data_viz_modal" onFocus={this.handleOpen} onBlur={this.handleClose}>
          <div class="modal-content">
            <h4>Add a Data Visualization</h4>
            <div class="row">
              <div class="col s12">
                <ul class="tabs" style={{backgroundColor:"#fafafa"}}>
                  <li class="tab col s3"><a href="#test1">Plot 1</a></li>
                  <a style={{height: "100%", backgroundColor: "#fafafa"}} class="waves-effect waves-light btn valign-wrapper">
                    <i class="material-icons">add</i>
                  </a>
                </ul>
              </div>
            </div>
            <div class="divider"></div>
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

export default MainGraphComponent;
