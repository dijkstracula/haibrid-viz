import React, { Component } from 'react';
import './App.css';
import {LatencyLineGraph} from './components/LatencyLineGraph'
import {ClientMsg, Sample, Workload, ServerMsg, Arc} from './interfaces';
import { WorkloadSliders } from './components/WorkloadSliders';
import { ArcsetHistogram } from './components/ArcsetHistogram';

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
    samples.push(s)

    const current_ts = Date.now()
    s.ts = current_ts
    samples = samples.filter((s) => current_ts - s.ts < 5000)
    this.setState({samples: samples})
  }

  // Invoked when a message from the server has been received.
  onMessage(ev: MessageEvent) {
    const blob = JSON.parse(ev.data)
  
    switch (blob["type"] as ServerMsg) {
      case "sample":
          const s = blob["sample"] as Sample
          const wk = blob["workload"] as Workload
          this.append_sample(s)
          this.setState({workload: wk})
    }
  }

    
  // Invoked when the user has changed the workload sliders.
  onUpdateWorkload(w: Workload) {
    this.setState({workload: w})

    if (this.ws !== undefined) {
      const blob = { type: "workload", workload: w }
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
    const mostRecentSample = this.state.samples[this.state.samples.length - 1]
    const arcset: Arc[] = mostRecentSample ? 
      (mostRecentSample.split_internals ? mostRecentSample.split_internals.arcs : [] ) : []

    return (
      <div>
        <div className="App">
          <div>
            <h2>Latency</h2>
          <LatencyLineGraph samples={this.state.samples} />
          </div>
          <div className="container flex-direction=column">
            <div>
              <h2>Workload</h2>
              <WorkloadSliders 
                workload={this.state.workload} 
                onChange={(w) => this.onUpdateWorkload(w)}/>
            </div>
            <div>
              <ArcsetHistogram arcs={arcset} />
            </div>
          </div>
          <div className="container flex-direction=column">
            <h2>Current datapoint</h2>
            <pre>N/A</pre>
            {this.state.workload.alpha}
          </div>
        </div>
        <footer>{this.state.msg}</footer>
      </div>
    )
  }
}