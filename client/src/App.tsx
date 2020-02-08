import React, { Component } from 'react';
import './App.css';
import * as sample from './sample';

type AppState = {
  msg: String
  sample: sample.Sample | undefined;
}

const URL = "ws://localhost:3030";

export default class App extends Component<{}, AppState> {
  public state: AppState = {sample: undefined, msg: "Conncting to " + URL + "..."};
  ws = new WebSocket(URL);

  componentDidMount() {
    this.ws.onopen = () => {
      this.setState({msg: "Connected to " + URL})
    };
    this.ws.onmessage = (ev: MessageEvent) => {
      const blob = JSON.parse(ev.data);
      const s = blob["sample"] as sample.Sample;
      this.setState({msg: blob["msg"], sample: s as sample.Sample});
    };
    this.ws.onclose = () => {
      this.setState({msg: "Reconnecting to " + URL, sample: undefined})
      this.ws = new WebSocket(URL)
    };
    this.ws.onerror = (ev: Event) => {
      this.setState({msg: "ERROR"})
    }
  }
  render() {
    return (
      <div className="App">
        <h1>{this.state.msg}</h1>
        <p>latency: {this.state.sample !== undefined ? (this.state.sample as sample.Sample).lat : "N/A"} </p>
      </div>
    )
  }
}