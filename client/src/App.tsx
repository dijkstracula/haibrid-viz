import React, { Component } from 'react';
import './App.css';
import {LatencyLineGraph} from './components/LatencyLineGraph'
import {ClientMsg, Sample, Workload, ServerMsg} from './interfaces';
import { WorkloadSliders } from './components/WorkloadSliders';

type AppState = {
  msg: String
  samples: Sample[]
  workload: Workload
}

const URL = "ws://localhost:3030";

export default class App extends Component<{}, AppState> {
  public state: AppState = {
    samples: [], 
    msg: "Connecting to " + URL + "...", 
    workload: {alpha: 0, indel: 0.0, range: 0.0}
  };

  ws: WebSocket | undefined

  append_sample(s: Sample) {
    let samples = this.state.samples;
    if (samples.length >= 50) {
      samples.shift()
    }
    samples.push(s)
    this.setState({samples: samples})
  }

  // Invoked when a message from the server has been received.
  onMessage(ev: MessageEvent) {
    const blob = JSON.parse(ev.data)
  
    switch (blob["type"] as ServerMsg) {
      case "sample":
          const s = blob["sample"] as Sample
          const wk = blob["workload"] as Workload
          console.log(blob["workload"])
          this.append_sample(s)
          this.setState({workload: blob["workload"]})
    }
  }

    
  // Invoked when the user has changed the workload sliders.
  onUpdateWorkload(w: Workload) {
    this.setState({workload: w})
    const blob = {
      type: "workload",
      workload: w
    }
    if (this.ws !== undefined) {
      this.ws.send(JSON.stringify(blob))
    }
  }

  componentDidMount() {
    let retries = 0;

    let init_ws = (): void => {
      this.ws = new WebSocket(URL)

      this.ws.onopen = () => {
        this.setState({msg: "Connected to " + URL})
        retries = 0
      }
  
      this.ws.onmessage = (ev) => { this.onMessage(ev) }

      this.ws.onclose = () => {
        this.setState({msg: `Connection closed; reconnecting to ${URL} in 1 second (retries: ${retries++})`})
        setTimeout(init_ws, 1000)
      }

      this.ws.onerror = (ev: Event) => {
        this.setState({msg: `Connection errored`})
        //TODO: seems like an error also closes, so we don't have a setTimeout
        //call here, but that seems worth validating.
      }
    }
    init_ws()
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
          <div>
            <h2>Workload</h2>
            <WorkloadSliders 
              workload={this.state.workload} 
              onChange={(w) => this.onUpdateWorkload(w)}/>
          </div>
          <div className="foo">
            <h2>Current datapoint</h2>
            <pre>{JSON.stringify(this.state.samples[this.state.samples.length - 1],null,2)}</pre>
            {this.state.workload.alpha}
          </div>
        </div>
        <footer>{this.state.msg}</footer>
      </div>
    )
  }
}