import React, {
  Component
} from "react";
import {
  render
} from "react-dom";
import M from 'materialize-css'

export class CombineDataModal extends Component {

  // FIXME: The opening and the closing does not work as well as I want
  // The problem is that unless cancel is pressed explicitly, the handleClose
  // function is not run. Going to keep it this way for now, but it needs
  // to be fixed later on.

  constructor(props) {
    super(props);
    this.state = {
      count: 0,
      notebook_id: this.props.id,
      columns: this.props.columns,
      chosen_option: "horizontal",
      select_left_dataset_value: null,
      select_right_dataset_value: null,

      select_horizontal_how_value: "inner",
      select_vertical_how_value: "outer",

      select_left_on_value: "auto",
      select_right_on_value: "auto",

      input_left_suffix_value: "",
      input_right_suffix_value: "",

      checkbox_ignore_index_value: false,

      checkbox_sort_value: false,

      checkbox_indicator_value: false,

      checkbox_new_dataframe_value: false,
      input_new_dataframe_value: null,

    }
    this.prepareComponent = this.prepareComponent.bind(this);
    this.createDatasetSelect = this.createDatasetSelect.bind(this);
    this.createLeftColumnSelect = this.createLeftColumnSelect.bind(this);
    this.createRightColumnSelect = this.createRightColumnSelect.bind(this);
    this.handleOptionChange = this.handleOptionChange.bind(this);

    this.handleLeftDataframeChange = this.handleLeftDataframeChange.bind(this);
    this.handleRightDataframeChange = this.handleRightDataframeChange.bind(this);
    this.handleLeftOnChange = this.handleLeftOnChange.bind(this);
    this.handleRightOnChange = this.handleRightOnChange.bind(this);

    this.handleHorizontalHowChange = this.handleHorizontalHowChange.bind(this);
    this.handleVerticalHowChange = this.handleVerticalHowChange.bind(this);

    this.handleIndicatorChange = this.handleIndicatorChange.bind(this);

    this.handleLeftSuffixChange = this.handleLeftSuffixChange.bind(this);
    this.handleRightSuffixChange = this.handleRightSuffixChange.bind(this);

    this.handleIgnoreIndexChange = this.handleIgnoreIndexChange.bind(this);
    this.handleSortChange = this.handleSortChange.bind(this);


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
    var left_selects = document.getElementsByClassName("combine_data_modal_left_dataframe_select");
    for (var select of left_selects) {
      select.innerHTML = "";
      for (var dataset of this.props.datasets) {
        select.options.add(new Option(dataset, dataset));
      }
      select.selectedIndex = 0;
      var left_select_value = select.value
      M.FormSelect.init(select);
    }

    var right_selects = document.getElementsByClassName("combine_data_modal_right_dataframe_select");
    for (var select of right_selects) {
      select.innerHTML = "";
      for (var dataset of this.props.datasets) {
        select.options.add(new Option(dataset, dataset));
      }
      if (this.props.datasets.length > 1) {
        select.selectedIndex = 1;
      }
      else{
        select.selectedIndex = 0
      }
      var right_select_value = select.value
      M.FormSelect.init(select);
    }
    this.setState({
      select_left_dataset_value: left_select_value,
      select_right_dataset_value: right_select_value,
    });
    this.createLeftColumnSelect(left_select_value);
    this.createRightColumnSelect(right_select_value);
  }

  createLeftColumnSelect(left_dataframe) {
    var left_select = document.getElementById("combine_data_modal_left_on_select")
    left_select.innerHTML = ""
    left_select.options.add(new Option("Auto", "auto"));
    left_select.options.add(new Option("Index", "index"));
    for (var column of this.props.columns[left_dataframe]) {
      left_select.options.add(new Option(column, column));
    }
    left_select.selectedIndex = 0;
    M.FormSelect.init(left_select);
    this.setState({
      select_left_on_value: left_select.value,
    });
  }

  createRightColumnSelect(right_dataframe) {
    var right_select = document.getElementById("combine_data_modal_right_on_select")
    right_select.innerHTML = ""
    right_select.options.add(new Option("Auto", "auto"));
    right_select.options.add(new Option("Index", "index"));
    for (var column of this.props.columns[right_dataframe]) {
      right_select.options.add(new Option(column, column));
    }
    right_select.selectedIndex = 0;
    M.FormSelect.init(right_select)
    this.setState({
      select_right_on_value: right_select.value,
    });
  }

  handleOptionChange(event) {
    console.log(event.target.innerHTML);
    this.setState({
      chosen_option: event.target.innerHTML,
    })
  }

  handleLeftDataframeChange(event) {
    var left_selects = document.getElementsByClassName("combine_data_modal_left_dataframe_select");
    var selected = event.target.selectedIndex;
    for (var select of left_selects) {
      select.selectedIndex = selected;
      M.FormSelect.init(select)
    }
    this.setState({
      select_left_dataset_value: event.target.value,
    });
    this.createLeftColumnSelect(event.target.value)
  }

  handleRightDataframeChange(event) {
    var right_selects = document.getElementsByClassName("combine_data_modal_right_dataframe_select");
    var selected = event.target.selectedIndex;
    for (var select of right_selects) {
      select.selectedIndex = selected;
      M.FormSelect.init(select)
    }
    this.setState({
      select_right_dataset_value: event.target.value,
    });
    this.createRightColumnSelect(event.target.value);
  }

  handleLeftOnChange(event) {
    this.setState({
      select_left_on_value: event.target.value,
    });
  }

  handleRightOnChange(event) {
    this.setState({
      select_right_on_value: event.target.value,
    })
  }

  handleHorizontalHowChange(event) {
    this.setState({
      select_horizontal_how_value: event.target.value,
    });
  }

  handleVerticalHowChange(event) {
    this.setState({
      select_vertical_how_value: event.target.value,
    });
    var sort_checkbox = document.getElementById("combine_data_modal_sort_checkbox")
    if (event.target.value == "inner") {
      this.state.previous_checkbox_state = sort_checkbox.checked
      sort_checkbox.checked = true;
      sort_checkbox.disabled = true;
    }
    else {
      sort_checkbox.disabled = false;
      sort_checkbox.checked = this.state.previous_checkbox_state
    }
  }

  handleIndicatorChange(event) {
    this.setState({
      checkbox_indicator_value: event.target.checked,
    });
    var indicator_checkboxes = document.getElementsByClassName("combine_data_modal_indicator_checkbox")
    for (var indicator_checkbox of indicator_checkboxes) {
      indicator_checkbox.checked = event.target.checked;
    }
  }

  handleLeftSuffixChange(event) {
    this.setState({
      input_left_suffix_value: event.target.value,
    });
  }

  handleRightSuffixChange(event) {
    this.setState({
      input_right_suffix_value: event.target.value,
    });
  }

  handleIgnoreIndexChange(event) {
    this.setState({
      checkbox_ignore_index_value: event.target.checked,
    });
  }

  handleSortChange(event) {
    this.setState({
      checkbox_sort_value: event.target.checked,
    });
  }

  handleNewDataframeCheckboxChange(event) {
    var text_inputs = document.getElementsByClassName("combine_data_modal_new_dataframe_input");
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
    var checkboxes = document.getElementsByClassName("combine_data_modal_new_dataframe_checkbox");
    for (var checkbox of checkboxes) {
      checkbox.checked = event.target.checked;
    }
    M.updateTextFields();
  }

  handleNewDataframeInputChange(event) {
    var text_inputs = document.getElementsByClassName("combine_data_modal_new_dataframe_input");
    for (var text_input of text_inputs) {
      text_input.value = event.target.value;
      M.updateTextFields();
    }
    this.setState({
      input_new_dataframe_value: event.target.value
    })
  }


  handleClick() {
    const csrf = this.getCookie("csrftoken");
    let formData = new FormData();
    formData.append("id", this.state.notebook_id);
    formData.append("left_dataset", this.state.select_left_dataset_value);
    formData.append("right_dataset", this.state.select_right_dataset_value);
    formData.append("option", this.state.chosen_option);
    formData.append("new_dataframe", JSON.stringify(this.state.checkbox_new_dataframe_value));
    formData.append("new_dataframe_value", this.state.input_new_dataframe_value);
    formData.append("indicator", JSON.stringify(this.state.checkbox_indicator_value));

    formData.append("left_on", this.state.select_left_on_value);
    formData.append("right_on", this.state.select_right_on_value);
    formData.append("left_suffix", this.state.input_left_suffix_value);
    formData.append("right_suffix", this.state.input_right_suffix_value);

    formData.append("horizontal_how", this.state.select_horizontal_how_value);
    formData.append("vertical_how", this.state.select_vertical_how_value);

    formData.append("sort", JSON.stringify(this.state.checkbox_sort_value));
    console.log(this.state.chosen_option);
    formData.append("ignore_index", JSON.stringify(this.state.checkbox_ignore_index_value));


    const requestOptions = {
      method: "POST",
      headers: {csrf: csrf},
      body: formData,
    };
    fetch("/api/combine-data", requestOptions)
    .then((response) => response.json())
    .then((data) => this.props.updateState(data))
  }

  handleOpen(e) {
    var modal = document.getElementById("combine_data_modal");
    if ((e.target == modal) && (this.state.count == 0)){
      this.setState({
        count: 1,
      });
      this.prepareComponent();
    }
  }

  handleClose(e) {
    var modal = document.getElementById("combine_data_modal");
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
        <div class="modal" id="combine_data_modal" onFocus={this.handleOpen} onBlur={this.handleClose}>
          <div class="modal-content">
            <h4>Combine Data</h4>
            <div class="divider"></div>
            <div class="row">
              <div class="col s6" style={{paddingTop: "10vh"}}>
                <div class="valign-wrapper modal-valign-wrapper">
                  <div class="card" style={{backgroundColor: "#0f3741"}}>
                    <div class="card-content white-text">
                      <p style={{fontSize:"12pt"}}>
                        Select the data <br /><br />
                        Select the column for which you would like to find missing values <br /> <br />
                        Check the checkbox if a custom symbol denotes the missing values (not NaN) <br /> <br />
                        Enter the custom symbol in the textbox
                      </p>
                    </div>
                    <div class="card-action">
                      <a href="#!">More Information</a>
                    </div>
                  </div>
                </div>
              </div>
              <div class="center col s6" style={{paddingTop: "2.5%"}}>
                <ul onClick={this.handleOptionChange} class="tabs" style={{backgroundColor:"#fafafa"}}>
                  <li class="tab col s6"><a style={{color: "#0f3741"}} href="#horizontal">horizontal</a></li>
                  <li class="tab col s6"><a style={{color: "#0f3741"}} href="#vertical">vertical</a></li>
                </ul>

                <div id="horizontal">
                  <div class="row" style={{paddingTop: "12%"}}>

                    <div class="input-field col s12 m6">
                      <select class="combine_data_modal_left_dataframe_select" onChange={this.handleLeftDataframeChange}></select>
                      <label>Left Dataframe:</label>
                    </div>

                    <div class="input-field col s12 m6">
                      <select class="combine_data_modal_right_dataframe_select" onChange={this.handleRightDataframeChange}></select>
                      <label>Right Dataframe:</label>
                    </div>

                    <div class="input-field col s12 m6">
                      <select id="combine_data_modal_left_on_select" onChange={this.handleLeftOnChange}></select>
                      <label>Left on:</label>
                    </div>

                    <div class="input-field col s12 m6">
                      <select id="combine_data_modal_right_on_select" onChange={this.handleRightOnChange}></select>
                      <label>Right on:</label>
                    </div>


                    <div class="input-field col s12 m6">
                      <select id="combine_data_modal_horizontal_how_select" onChange={this.handleHorizontalHowChange}>
                        <option selected value="inner">Inner</option>
                        <option value="outer">Outer</option>
                        <option value="left">Left</option>
                        <option value="right">Right</option>
                      </select>
                      <label for="combine_data_modal_horizontal_how_select">How</label>
                    </div>

                    <div class="input-field col s12 m6" style={{paddingRight: "50px"}}>
                    <p>
                      <label>
                        <input class="combine_data_modal_indicator_checkbox" type="checkbox" onChange={this.handleIndicatorChange}/>
                        <span>Add Indicator</span>
                      </label>
                    </p>
                    </div>

                    <div class="input-field col s12 m6">
                      <input placeholder="_x" id="combine_data_modal_left_suffix_input" type="text" onChange={this.handleLeftSuffixChange} />
                      <label class="active" for="combine_data_modal_left_suffix_input">Left Suffix:</label>
                    </div>

                    <div class="input-field col s12 m6">
                      <input placeholder="_y" id="combine_data_modal_right_suffix_input" type="text" onChange={this.handleRightSuffixChange} />
                      <label class="active" for="combine_data_modal_right_suffix_input">Right Suffix:</label>
                    </div>

                    <div class="col s12 m6" style={{paddingTop: "15px", paddingRight: "37px"}}>
                      <p>
                        <label>
                          <input class="combine_data_modal_new_dataframe_checkbox" type="checkbox" onChange={this.handleNewDataframeCheckboxChange}/>
                          <span>New Dataframe</span>
                        </label>
                      </p>
                    </div>

                    <div class="input-field col s12 m6">
                      <input disabled id="combine_data_modal_new_dataframe_input_0" class="combine_data_modal_new_dataframe_input" type="text" onChange={this.handleNewDataframeInputChange} />
                      <label class="active" for="combine_data_modal_new_dataframe_input_0">Dataframe Name:</label>
                    </div>

                  </div>
                </div>

                <div id="vertical">
                  <div class="row" style={{paddingTop: "12%"}}>

                    <div class="input-field col s12 m6">
                      <select class="combine_data_modal_left_dataframe_select" onChange={this.handleLeftDataframeChange}></select>
                      <label>Left Dataframe:</label>
                    </div>

                    <div class="input-field col s12 m6">
                      <select class="combine_data_modal_right_dataframe_select" onChange={this.handleRightDataframeChange}></select>
                      <label>Right Dataframe:</label>
                    </div>

                    <div class="input-field col s12 m6">
                      <select id="combine_data_vertical_how_select" onChange={this.handleVerticalHowChange}>
                        <option selected value="outer">Outer</option>
                        <option value="inner">Inner</option>
                      </select>
                      <label for="combine_data_vertical_how_select">How</label>
                    </div>

                    <div class="input-field col s12 m6" style={{paddingRight: "50px"}}>
                      <p>
                        <label>
                          <input type="checkbox" onChange={this.handleIgnoreIndexChange}/>
                          <span>Ignore Index</span>
                        </label>
                      </p>
                    </div>

                    <div class="col s12 m6" style={{paddingRight: "50px"}}>
                      <p>
                        <label>
                          <input class="combine_data_modal_indicator_checkbox"type="checkbox" onChange={this.handleIndicatorChange}/>
                          <span>Add Indicator</span>
                        </label>
                      </p>
                    </div>

                    <div class="col s12 m6" style={{paddingRight: "105px"}}>
                      <p>
                        <label>
                          <input id="combine_data_modal_sort_checkbox" type="checkbox" onChange={this.handleSortChange}/>
                          <span>Sort</span>
                        </label>
                      </p>
                    </div>


                    <div class="col s12 m6" style={{paddingTop: "15px", paddingRight: "37px"}}>
                    <p>
                      <label>
                        <input class="combine_data_modal_new_dataframe_checkbox" type="checkbox" onChange={this.handleNewDataframeCheckboxChange}/>
                        <span>New Dataframe</span>
                      </label>
                    </p>
                    </div>

                    <div class="input-field col s12 m6">
                      <input disabled id="combine_data_modal_new_dataframe_input_1" class="combine_data_modal_new_dataframe_input" type="text" onChange={this.handleNewDataframeInputChange} />
                      <label class="active" for="combine_data_modal_new_dataframe_input_1">Dataframe Name:</label>
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

export default CombineDataModal;
