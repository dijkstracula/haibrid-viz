import React, { Component } from 'react';
import './App.css';
import {LatencyLineGraph} from './components/LatencyLineGraph';
import {Sample} from './sample';

type AppState = {
  msg: String
  samples: Sample[];
}

const URL = "ws://localhost:3030";

export default class App extends Component<{}, AppState> {
  public state: AppState = {samples: [], msg: "Conncting to " + URL + "..."};
  ws = new WebSocket(URL);

  append_sample(s: Sample) {
    let samples = this.state.samples;
    if (samples.length >= 50) {
      samples.shift()
    }
    samples.push(s);
    
    this.setState(this.state);
  }

  componentDidMount() {
    this.ws.onopen = () => {
      this.setState({msg: "Connected to " + URL, samples: []})
    };
    this.ws.onmessage = (ev: MessageEvent) => {
      const blob = JSON.parse(ev.data)
      const s = blob["sample"] as Sample
      if (blob["msg"] !== "Incoming sample") {
        //TODO: we need to make messages a sum type so I know if I 
        //can pull out a sample.
        return
      }
      
      this.append_sample(s);
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
      <div>
        <header><h1>HAIbrid visualizer</h1></header>
        <div className="App">
          <div>
            <h2>Latency</h2>
          <LatencyLineGraph samples={this.state.samples} />
          </div>
          <div className="foo">
            <h2>Current datapoint</h2>
            <pre>{JSON.stringify(this.state.samples[this.state.samples.length - 1],null,2)}</pre>
          </div>
        </div>
      </div>
    )
  }
}