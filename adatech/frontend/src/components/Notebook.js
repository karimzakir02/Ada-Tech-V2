import React, { Component } from "react";
import {render} from "react-dom";
import Sidenav from "./Sidenav";

export default class Notebook extends Component {
  constructor(props){
    super(props);
    this.uploadFile = this.uploadFile.bind(this);
    this.state = {
      id: this.props.match.params.id,
      isAuthor: false,
      output: [],
    }
    this.id = this.props.match.params.id;
    this.getNotebookDetails();
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
//
  getNotebookDetails() {
    fetch("/api/get-notebook" + "?id=" + this.id)
    .then((response) => response.json())
    .then((data) => {
      this.setState({
          isAuthor: data.is_author,
          output: data.output,
      })
    });
  }
//
    uploadFile(e) {
      let formData = new FormData();
      formData.append("file", event.target.files[0]);
      const csrf = this.getCookie("csrftoken");
      const requestOptions = {
        method: "POST",
        headers: {csrf: csrf},
        body: formData,
      };
      fetch("/api/add-file", requestOptions)
        .then((response) => response.json())
        .then((data) => this.updateState(data))
    }
//
    updateState(data) {
      this.setState({
        output: JSON.parse(data.output),
      });
      console.log(this.state.output);
    }

  // Perhaps getNotebookDetails func can serve as a function that we call after
  // getting a new output. Good idea past me!

  render() {
    return (
      <div>
      <Sidenav />
      <div class="row" style={{padding: "10px"}}>
      <div class="col s11" style={{padding: "10px"}}>
      <div class="container" id = "output_div">
        <p style = {{textAlign: "center"}}>Welcome to your notebook!</p>
      </div>
      </div>
      <div class="col s1">
        <form class="pushpin-buttons pinned" method="POST" enctype = "multipart/form-data" style = {{marginLeft: "8px", paddingTop: "15px"}}>
          <button style = {{backgroundColor: "#790604"}} class = "btn-floating btn-file btn-large waves-effect waves-light" type = "submit">
            <input type="file" name="document" onChange={this.uploadFile} />
            <i class="material-icons">add</i>
          </button>
        </form>
      </div>
      </div>
      </div>
    );
  }
}
