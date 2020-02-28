import React, { Component } from 'react';
import './App.css';
import {LatencyLineGraph} from './components/LatencyLineGraph'
import {ClientMsg, Sample, Workload, ServerMsg, Arc} from './interfaces';
import { WorkloadSliders } from './components/WorkloadSliders';
import { ArcsetHistogram } from './components/ArcsetHistogram';
import { DataStructureChooser } from './components/DataStructureChooser';

type AppState = {
  msg: String
  arcset: Arc[]
  samples: Sample[]
  actives: string[]
  workload: Workload
}

const URL = "ws://localhost:3030";

export default class App extends Component<{}, AppState> {
  public state: AppState = {
    samples: [], 
    arcset: [],
    actives: ["split", "hs_hash", "google_btree", "skiplist"], //TODO
    msg: "Connecting to " + URL + "...", 
    workload: {indel: 0.0, range: 0.0}
  };

  ws: WebSocket | undefined

  // Consumes a list of sample updates, and returns the final arcset
  // in the updates, if one exists.  if one doesn't, then just return
  // the existing arcset.
  update_arcset(l: Sample[]): Arc[] {
    for (let i = l.length-1; i >= 0; i--) {
      const s = l[i]
      if (s.split_internals) {
        return s.split_internals.arcs
      }
    }
    return this.state.arcset
  }

  update_samples(l: Sample[]): Sample[] {
    let samples = this.state.samples;

    // Set the timestamp of the samples we've received.
    const current_ts = Date.now()
    l.forEach((s) => s.ts = current_ts)
    
    //todo: find index of first valid ts and slice from there?
    samples = samples.filter((s) => current_ts - s.ts < 5000)

    samples = samples.concat(l)
    console.log(samples.length)
    return samples
  }

  // Invoked when a message from the server has been received.
  onMessage(ev: MessageEvent) {
    const blob = JSON.parse(ev.data)
  
    switch (blob["type"] as ServerMsg) {
      case "samples":
          const l = blob["samples"] as Sample[]
          const wk = blob["workload"] as Workload
          const samples = this.update_samples(l)
          const arcset = this.update_arcset(l)
          this.setState({
            samples: samples, 
            workload: wk, arcset: arcset})
    }
  }

    
  // Invoked when the user has changed the workload sliders.
  onUpdateWorkload(w: Workload) {
    this.setState({workload: w})

    if (this.ws !== undefined) {
      const json = { type: "workload", workload: w }
      this.ws.send(JSON.stringify(json))
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
        <div className="App">
          <div className="container flex-direction=column">
            <div>
              <h2>Latency</h2>
              <LatencyLineGraph 
                samples={this.state.samples} 
                actives={this.state.actives}
              />
            </div>
            <div>
              <h2>Substructure</h2>
              <ArcsetHistogram arcs={this.state.arcset} />
            </div>
          </div>
          <div className="container flex-direction=column">
            <div>
              <h2>Workload</h2>
              <WorkloadSliders 
                workload={this.state.workload} 
                onChange={(w) => this.onUpdateWorkload(w)}/>
            </div>
            <div>
              <h2>Legend</h2>
              <DataStructureChooser 
                structures={this.state.actives} //TODO
                actives={this.state.actives}
                onChange={(as: string[]) => console.log(as)} />
            </div>
          </div>
          <div className="container flex-direction=column">
            <h2>Current datapoint</h2>
            <pre>{JSON.stringify(this.state.samples.find((s) => s.ds === "split"))} </pre>
          </div>
        </div>
        <footer>{this.state.msg}</footer>
      </div>
    )
  }
}