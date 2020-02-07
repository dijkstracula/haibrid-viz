import React, { Component } from 'react';
import './App.css';

type AppState = {
  msg: String
}

export default class App extends Component<{}, AppState> {
  public state = { msg: "Loading..." };

  componentDidMount() {
    fetch("/api/status")
    .then(res => res.text())
    .then(json => this.setState({msg: json}))
  }
  render() {
    return (
      <div className="App">
        {this.state.msg}
      </div>
    )
  }
}