import React, { Component } from 'react';
import './App.css';
import {ClientMsg, Sample, Workload, ServerMsg, Arc} from './interfaces';
import { WorkloadSliders } from './components/WorkloadSliders';
import { ArcsetHistogram } from './components/ArcsetHistogram';
import { DataStructureChooser } from './components/DataStructureChooser';
import { XputLineGraph } from './components/XputLineGraph';

type AppState = {
  msg: String
  arcset: Arc[]
  samples: Sample[]
  actives: string[]
  workload: Workload
}

//const URL = "ws://nathan.westus2.cloudapp.azure.com:3030";
const URL = "ws://localhost:3030";

const STRUCTURES =  ["split", "hs_hash", "google_btree", "skiplist"] //TODO, shouldn't hard code these

export default class App extends Component<{}, AppState> {
  public state: AppState = {
    samples: [],
    arcset: [],
    actives: STRUCTURES,
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
    // Set the timestamp of the samples we've received.
    const current_ts = Date.now()
    l.forEach((s) => s.ts = current_ts)

    //todo: find index of first valid ts and slice from there?
    let samples = this.state.samples;
    samples = samples.filter((s) => current_ts - s.ts < 5000)

    samples = samples.concat(l)
    return samples
  }

  // Invoked when a message from the server has been received.
  onMessage(ev: MessageEvent) {
    const blob = JSON.parse(ev.data)

    switch (blob["type"] as ServerMsg) {
      case "message":
        const msg = blob["msg"] as string
        this.setState({msg: msg})
        break
        
      case "samples":
        const l = blob["samples"] as Sample[]
        const wk = blob["workload"] as Workload

        if (l === undefined || wk === undefined) {
          return
        }

        const samples = this.update_samples(l)
        const arcset = this.update_arcset(l)
        this.setState({
          samples: samples,
          workload: wk,
          arcset: arcset})
    }
  }


  // Invoked when the user has changed the workload sliders.
  onUpdateWorkload(w: Workload) {
    this.setState({workload: w})

    if (this.ws !== undefined) {
      const json = { type: "workload" as ClientMsg, workload: w }
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
              <h2>Throughput</h2>
              <XputLineGraph
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
                structures={STRUCTURES} //TODO
                actives={this.state.actives}
                onChange={(as: string[]) => this.setState({actives: as}) } />
            </div>
          </div>
          <div className="container flex-direction=column">
            <h2>Description</h2>
            <p>This demo shows a HAIbrid index structure in action. 
              HAIbrid tries to achieve universally good performance regardless of the workload by 
              dynamically transitioning between optimal structures (learned offline). Try changing 
              the workload parameters on the left and watch HAIbrid switch from one structure to 
              another! For example:
            </p>
            <p>
              <li>
              Make the number of range queries greater than 0. HAIbrid immediately realizes that a hashtable 
              is a bad structure and transitions to a B-tree. Since a hashtable is unordered, 
              the transition happens in one shot, resulting in a dip in performance followed by 
              near-optimal performance matching a B-tree.
              </li>
              <li>
              Next, reduce the range queries back to 0. HAIbrid immediately realizes that a 
              hashtable is a better structure and transitions to it. Since a B-tree is ordered, the 
              transition is done gradually over time. When enough items have been transferred to the 
              hashtable, the superior performance of queries hitting the hashtable outweights the cost 
              of transitioning, until eventually the transition is complete and we achieve near-optimal 
              performance matching the hashtable.
              </li>
            </p>
          </div>
        </div>
        <div className="footer">Current status: <b>{this.state.msg}</b></div>
      </div>
    )
  }
}
