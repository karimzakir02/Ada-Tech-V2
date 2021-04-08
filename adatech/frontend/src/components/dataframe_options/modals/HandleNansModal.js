import React, {
  Component
} from "react";
import {
  render
} from "react-dom";
import M from 'materialize-css'

export class HandleNansModal extends Component {

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
      select_dataset_value: this.props.datasets[0],
      select_columns_value: null,
      checkbox_custom_symbol_value: false,
      input_custom_symbol_value: null,
      checkbox_new_dataframe_value: false,
      input_new_dataframe_value: null,

      select_drop_by_value: "0",

      input_substitute_value: "",

      select_numerical_columns_value: null,

      select_strategy_value: "mean",

      chosen_option: "drop",
    }
    this.prepareComponent = this.prepareComponent.bind(this);
    this.createDatasetSelect = this.createDatasetSelect.bind(this);
    this.createColumnSelect = this.createColumnSelect.bind(this);

    this.handleDatasetChange = this.handleDatasetChange.bind(this);
    this.handleColumnSelectChange = this.handleColumnSelectChange.bind(this);
    this.handleCustomSymbolCheckboxChange = this.handleCustomSymbolCheckboxChange.bind(this);
    this.handleCustomSymbolInputChange = this.handleCustomSymbolInputChange.bind(this);
    this.handleNewDataframeCheckboxChange = this.handleNewDataframeCheckboxChange.bind(this);
    this.handleNewDataframeInputChange = this.handleNewDataframeInputChange.bind(this);

    this.handleDropByChange = this.handleDropByChange.bind(this);

    this.handleSubstituteChange = this.handleSubstituteChange.bind(this);

    this.handleOptionChange = this.handleOptionChange.bind(this);

    this.handleNumericalColumnSelectChange = this.handleNumericalColumnSelectChange.bind(this);

    this.handleStrategySelectChange = this.handleStrategySelectChange.bind(this);

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
    var selects = document.getElementsByClassName("handle_nans_modal_select");
    for (var select of selects) {
      select.innerHTML = "";
      for (var dataset of this.props.datasets) {
        select.options.add(new Option(dataset, dataset));
      }
      select.selectedIndex = 0;
      var select_value = select.value
      M.FormSelect.init(select);
    }
    this.setState({
      select_dataset_value: select_value,
    });
    this.createColumnSelect(select.value);
  }

  createColumnSelect(select_value) {
    var selects = document.getElementsByClassName("handle_nans_modal_column_select");
    for (var select of selects) {
      select.innerHTML = "";
      for (var column of this.props.columns[select_value]) {
        select.options.add(new Option(column, column));
      }
      for (var i=0; i < this.props.columns[select_value].length; i++){
        select.options[i].selected = true;
      }
      M.FormSelect.init(select);
    }

    var numerical_selects = document.getElementsByClassName("handle_nans_modal_numerical_columns_select");
    for (var select of numerical_selects) {
      select.innerHTML = "";
      for (var column of this.props.numerical_columns[select_value]) {
        select.options.add(new Option(column, column));
      }
      for (var i=0; i < this.props.numerical_columns[select_value].length; i++){
        select.options[i].selected = true;
      }
      M.FormSelect.init(select);
    }
    this.setState({
      select_columns_value: this.props.columns[select_value],
      select_numerical_columns_value: this.props.numerical_columns[select_value]
    });
  }

  handleOptionChange(event) {
    this.setState({
      chosen_option: event.target.innerHTML,
    });
    var card = document.getElementById("handle_nans_modal_description")
    if (event.target.innerHTML == "drop"){
      var description = `
      Handle your missing data by dropping records/variables with missing data. Select the columns
      to which this method will be applied and choose to drop rows or columns<br /> <br />
      In case the missing data is denoted by a custom symbol (not NaN),
      check the appropriate box and enter the custom symbol <br /> <br />
      The changes will be applied directly to the dataset. If you would like to create a new dataset,
      check the appropriate box and enter the new name
      `
      card.innerHTML = description
    }
    else if (event.target.innerHTML == "substitute") {
      var description = `
      Handle your missing data by substituting the missing data. Select the columns to which this method
      will be applied and choose your substitute for the missing data<br /><br />
      In case the missing data is denoted by a custom symbol (not NaN),
      check the appropriate box and enter the custom symbol <br /> <br />
      The changes will be applied directly to the dataset. If you would like to create a new dataset,
      check the appropriate box and enter the new name
      `
      card.innerHTML = description
    }
    else {
      var description = `
      Handle your missing data by imputing it. Select the numerical columns to which this method will be applied
      and choose the appropriate imputing strategy<br /> <br />
      In case the missing data is denoted by a custom symbol (not NaN),
      check the appropriate box and enter the custom symbol <br /> <br />
      The changes will be applied directly to the dataset. If you would like to create a new dataset,
      check the appropriate box and enter the new name
      `
      card.innerHTML = description
    }
  }

  handleDropByChange(event) {
    this.setState({
      select_drop_by_value: event.target.value,
    })
  }

  handleSubstituteChange(event) {
    this.setState({
      input_substitute_value: event.target.value,
    })
  }

  handleStrategySelectChange(event) {
    this.setState({
      select_strategy_value: event.target.value,
    });
  }

  handleDatasetChange(event) {
    this.setState({
      select_dataset_value: event.target.value,
    });
    var selects = document.getElementsByClassName("handle_nans_modal_select");
    var selected_index = event.target.selectedIndex;
    for (var select of selects) {
      select.innerHTML = "";
      for (var dataset of this.props.datasets) {
        select.options.add(new Option(dataset, dataset));
      }
      select.selectedIndex = selected_index;
      var select_value = select.value;
      M.FormSelect.init(select);
    }
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

  handleNumericalColumnSelectChange(event) {
    var select = event.target
    var selected = []
    for (var i=0; i<select.options.length; i++) {
      if (select.options[i].selected == true) {
        selected.push(select.options[i].value);
      }
    }
    this.setState({
      select_numerical_columns_value: selected
    });
  }

  handleCustomSymbolCheckboxChange(event) {
    var text_inputs = document.getElementsByClassName("handle_nans_modal_custom_symbol_input");
    for (var text_input of text_inputs) {
      if (event.target.checked) {
        text_input.disabled = false;
      }
      else {
        text_input.value = "";
        text_input.disabled = true;
      }
    }
    var checkboxes = document.getElementsByClassName("handle_nans_modal_custom_symbol_checkbox");
    for (var checkbox of checkboxes) {
      checkbox.checked = event.target.checked;
    }

    this.setState({
      checkbox_custom_symbol_value: event.target.checked,
      input_custom_symbol_value: "",
    });

  }

  handleCustomSymbolInputChange(event) {
    var text_inputs = document.getElementsByClassName("handle_nans_modal_custom_symbol_input");
    for (var text_input of text_inputs) {
      text_input.value = event.target.value;
      M.updateTextFields();
    }
    this.setState({
      input_custom_symbol_value: event.target.value
    })
  }

  handleNewDataframeCheckboxChange(event) {
    var text_inputs = document.getElementsByClassName("handle_nans_modal_new_dataframe_input");
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
    var checkboxes = document.getElementsByClassName("handle_nans_modal_new_dataframe_checkbox");
    for (var checkbox of checkboxes) {
      checkbox.checked = event.target.checked;
    }
  }

  handleNewDataframeInputChange(event) {
    var text_inputs = document.getElementsByClassName("handle_nans_modal_new_dataframe_input");
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
    formData.append("dataset", this.state.select_dataset_value);
    formData.append("columns", JSON.stringify(this.state.select_columns_value));
    formData.append("custom_symbol", JSON.stringify(this.state.checkbox_custom_symbol_value));
    formData.append("custom_symbol_value", this.state.input_custom_symbol_value);
    formData.append("new_dataframe", JSON.stringify(this.state.checkbox_new_dataframe_value));
    formData.append("new_dataframe_value", this.state.input_new_dataframe_value);

    formData.append("handle_nans_option", this.state.chosen_option);
    formData.append("drop_by", this.state.select_drop_by_value);

    formData.append("substitute", this.state.input_substitute_value);

    formData.append("strategy", this.state.select_strategy_value);
    formData.append("numerical_columns", JSON.stringify(this.state.select_numerical_columns_value));

    const requestOptions = {
      method: "POST",
      headers: {csrf: csrf},
      body: formData,
    };

    this.setState({
      count: 0,
    });

    fetch("/api/handle-nans", requestOptions)
    .then((response) => response.json())
    .then((data) => this.props.updateState(data))
  }

  handleOpen(e) {
    var modal = document.getElementById("handle_nans_modal");
    if ((e.target == modal) && (this.state.count == 0)){
      this.setState({
        count: 1,
      });
      this.prepareComponent();
    }
  }

  handleClose(e) {
    var modal = document.getElementById("handle_nans_modal");
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
        <div class="modal" id="handle_nans_modal" onFocus={this.handleOpen} onBlur={this.handleClose}>
          <div class="modal-content">
            <h4>Handle Missing Values</h4>
            <div class="divider"></div>
            <div class="row">
              <div class="col s6" style={{paddingTop: "7vh"}}>
                <div class="valign-wrapper modal-valign-wrapper">
                  <div class="card" style={{backgroundColor: "#0f3741"}}>
                    <div class="card-content white-text">
                      <p style={{fontSize:"12pt"}} id="handle_nans_modal_description">
                      Handle your missing data by dropping records/variables with missing data. Select the columns
                      to which this method will be applied and choose to drop rows or columns<br /> <br />
                      In case the missing data is denoted by a custom symbol (not NaN),
                      check the appropriate box and enter the custom symbol <br /> <br />
                      The changes will be applied directly to the dataset. If you would like to create a new dataset,
                      check the appropriate box and enter the new name
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
                  <li class="tab col s4"><a style={{color: "#0f3741"}} href="#drop">drop</a></li>
                  <li class="tab col s4"><a style={{color: "#0f3741"}} href="#substitute">substitute</a></li>
                  <li class="tab col s4"><a href="#impute" style={{color: "#0f3741"}}>impute</a></li>
                </ul>

                <div id="drop">
                  <div class="row" style={{paddingTop: "15%"}}>

                    <div class="input-field col s12">
                      <select class="handle_nans_modal_select" onChange={this.handleDatasetChange}></select>
                      <label>Dataframe:</label>
                    </div>

                    <div class="input-field col s12 m6">
                      <select multiple class="handle_nans_modal_column_select" onChange={this.handleColumnSelectChange}></select>
                      <label>Columns:</label>
                    </div>

                    <div class="input-field col s6">
                      <select id="handle_nans_drop_select" onChange={this.handleDropSelectChange}>
                        <option selected value="0">Rows</option>
                        <option value="1">Columns</option>
                      </select>
                      <label for="handle_nans_drop_select">Drop Rows/Columns</label>
                    </div>

                    <div class="col s12 m6" style={{paddingTop: "15px"}}>
                    <p>
                      <label>
                        <input class="handle_nans_modal_custom_symbol_checkbox" type="checkbox" onChange={this.handleCustomSymbolCheckboxChange}/>
                        <span>Custom Symbol</span>
                      </label>
                    </p>
                    </div>

                    <div class="input-field col s12 m6">
                      <input disabled id="handle_nans_modal_custom_symbol_input_0" class="handle_nans_modal_custom_symbol_input" type="text" onChange={this.handleCustomSymbolInputChange} />
                      <label class="active" for="handle_nans_modal_custom_symbol_input_0">Custom Symbol Value:</label>
                    </div>

                    <div class="col s12 m6" style={{paddingTop: "15px"}}>
                      <p>
                        <label>
                          <input class="handle_nans_modal_new_dataframe_checkbox" type="checkbox" onChange={this.handleNewDataframeCheckboxChange}/>
                          <span>New Dataframe</span>
                        </label>
                      </p>
                    </div>

                    <div class="input-field col s12 m6">
                      <input disabled class="handle_nans_modal_new_dataframe_input" type="text" onChange={this.handleNewDataframeInputChange} />
                      <label class="active" for="handle_nans_modal_input">Dataframe Name:</label>
                    </div>

                  </div>
                </div>

                <div id="substitute">
                  <div class="row" style={{paddingTop: "15%"}}>
                    <div class="input-field col s12">
                      <select class="handle_nans_modal_select" onChange={this.handleDatasetChange}></select>
                      <label>Dataframe:</label>
                    </div>
                    <div class="input-field col s6">
                      <select multiple class="handle_nans_modal_column_select" onChange={this.handleColumnSelectChange}></select>
                      <label>Columns:</label>
                    </div>

                    <div class="input-field col s6">
                      <input id="handle_nans_modal_substitute_input" type="text" onChange={this.handleSubstituteChange} />
                      <label class="active" for="handle_nans_modal_substitute_input">Substutute:</label>
                    </div>

                    <div class="col s6" id="hand_nans_checkbox_field" style={{paddingTop: "15px"}}>
                      <p>
                        <label>
                          <input class="handle_nans_modal_custom_symbol_checkbox" type="checkbox" name="count_values" onChange={this.handleCustomSymbolCheckboxChange}/>
                          <span>Custom Symbol</span>
                        </label>
                      </p>
                    </div>
                    <div class="input-field col s12 m6">
                      <input disabled id="handle_nans_modal_custom_symbol_input_1" class="handle_nans_modal_custom_symbol_input" type="text" onChange={this.handleCustomSymbolInputChange} />
                      <label class="active" for="handle_nans_modal_custom_symbol_input_1">Custom Symbol Value:</label>
                    </div>

                    <div class="col s12 m6" id="handle_nans_checkbox_field" style={{paddingTop: "15px"}}>
                    <p>
                      <label>
                        <input class="handle_nans_modal_new_dataframe_checkbox" type="checkbox" onChange={this.handleNewDataframeCheckboxChange}/>
                        <span>New Dataframe</span>
                      </label>
                    </p>
                    </div>

                    <div class="input-field col s12 m6">
                      <input disabled class="handle_nans_modal_new_dataframe_input" type="text" onChange={this.handleNewDataframeInputChange} />
                      <label class="active" for="handle_nans_modal_input">Dataframe Name:</label>
                    </div>

                  </div>
                </div>

                <div id="impute">
                  <div class="row" style={{paddingTop: "15%"}}>
                    <div class="input-field col s12">
                      <select class="handle_nans_modal_select" onChange={this.handleDatasetChange}></select>
                      <label>Dataframe:</label>
                    </div>

                    <div class="input-field col s12 m6">
                      <select multiple class="handle_nans_modal_numerical_columns_select" onChange={this.handleNumericalColumnSelectChange}></select>
                      <label>Numerical Columns:</label>
                    </div>

                    <div class="input-field col s12 m6">
                      <select id="handle_nans_modal_impute_by_select" onChange={this.handleStrategySelectChange}>
                        <option selected value="mean">Mean</option>
                        <option value="median">Median</option>
                        <option value="most_frequent">Most Frequent</option>
                      </select>
                      <label for="handle_nans_drop_select">Strategy</label>
                    </div>

                    <div class="col s12 m6" id="hand_nans_checkbox_field" style={{paddingTop: "15px"}}>
                      <p>
                        <label>
                          <input class="handle_nans_modal_custom_symbol_checkbox" type="checkbox" name="count_values" onChange={this.handleCustomSymbolCheckboxChange}/>
                          <span>Custom Symbol</span>
                        </label>
                      </p>
                    </div>

                    <div class="input-field col s12 m6">
                      <input disabled id="handle_nans_modal_custom_symbol_input_2" class="handle_nans_modal_custom_symbol_input" type="text" onChange={this.handleCustomSymbolInputChange} />
                      <label class="active" for="handle_nans_modal_custom_symbol_input_2">Custom Symbol Value:</label>
                    </div>

                    <div class="col s12 m6" style={{paddingTop: "15px"}}>
                      <p>
                        <label>
                          <input class="handle_nans_modal_new_dataframe_checkbox" type="checkbox" onChange={this.handleNewDataframeCheckboxChange}/>
                          <span>New Dataframe</span>
                        </label>
                      </p>
                    </div>

                    <div class="input-field col s12 m6">
                      <input disabled class="handle_nans_modal_new_dataframe_input" type="text" onChange={this.handleNewDataframeInputChange} />
                      <label class="active" for="handle_nans_modal_input">Dataframe Name:</label>
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

export default HandleNansModal;
