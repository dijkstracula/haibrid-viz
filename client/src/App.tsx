import React, { Component } from 'react';
import './App.css';

type AppState = {
  msg: String
}

const URL = "ws://localhost:3030";

export default class App extends Component<{}, AppState> {
  public state = { msg: "Conncting to " + URL + "..."};
  ws = new WebSocket(URL);

  componentDidMount() {
    this.ws.onopen = () => {
      this.setState({msg: "Connected to " + URL})
    };
    this.ws.onmessage = (ev: MessageEvent) => {
      const blob = JSON.parse(ev.data);
      this.setState({msg: blob["msg"]})
    };
    this.ws.onclose = () => {
      this.setState({msg: "Reconnecting to " + URL})
      this.ws = new WebSocket(URL)
    };
    this.ws.onerror = (ev: Event) => {
      this.setState({msg: "ERROR"})
    }
  }
  render() {
    return (
      <div className="App">
        {this.state.msg}
      </div>
    )
  }
}