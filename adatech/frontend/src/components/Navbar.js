import React, { Component } from 'react';

export class Navbar extends Component {
  render() {
    const styles = {
      height: "90px",
      lineHeight: "90px",
      margin:0,
      padding:0,
    }
    return(
      <nav class="navbar" style = {styles}>
        <div class="nav-wrapper brand-color">
          <div class="container">
            <a href="#" class="brand-logo">Ada Tech.</a>
            <ul id="nav-mobile" class="right hide-on-med-and-down">
              <li><a style = {{fontSize: "17pt"}} href="/">Features</a></li>
              <li><a style = {{fontSize: "17pt"}} href="/">Login</a></li>
              <li><a style = {{fontSize: "17pt"}} href="/">Register</a></li>
            </ul>
          </div>
        </div>
  </nav>
      )
  }
}
export default Navbar
