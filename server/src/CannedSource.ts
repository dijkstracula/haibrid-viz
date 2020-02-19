// A source emits samples.
import * as fs from "fs";
import {Sample, Workload, Arc, DataStructure} from "./interfaces";

// A Phase comprises a set of Samples, either representing a transition from
// some structure to another, or the steady-state of a particular workload.
class Phase {
    begin: number
    end: number
    name: string
    //type: PhaseType
    wk: Workload
    samples: Sample[]

    static From(objblob: any, samples: Sample[]): Phase {
        const begin: number = objblob["begin"];
        const end: number = objblob["end"];
        const name: string = objblob["name"];
        const wk: Workload = objblob["workload"];
        
        // TODO: we should bsearch.  Ah well.
        const i = samples.findIndex((s) => s.total_ts >= begin);
        const j = samples.findIndex((s) => s.total_ts >= end);
        
        return {
            begin, end, name, wk, samples: samples.slice(i,j)
        };
    }
}

class CannedSource {
    samples: Sample[]
    currentPhase: Phase
    idx: number = 0
    workloads: Workload[] = []
    graph: Map<string, Phase> = new Map<string, Phase>();

    constructor(path: string) {
        const blob = JSON.parse(fs.readFileSync(path, "utf8"));
        this.currentPhase = this.initPhaseGraph(blob);

        setInterval(() => {
            const str = JSON.stringify(this.currentPhase.wk);
            console.log(str + " " + this.idx);

            this.idx++;
            if (this.idx >= this.currentPhase.samples.length) {
                // If we have exhausted the current phase's samples,
                // transition to the steady state for this workload.
                const key = JSON.stringify([this.currentPhase.wk, this.currentPhase.wk]);
                console.log(`Transitioning to ${key}`);
                this.currentPhase = this.graph.get(key);
                this.idx = 0;
            }
        }, 99);
    }

    updateWorkload(w: Workload) {
        let bestWk = this.workloads[0];
        let bestDist = 99999;

        for (const i in this.workloads) {
            const currWk = this.workloads[i];
            const currDist = Math.sqrt(
                (currWk.indel - w.indel)**2 + 
                (currWk.range - w.range)**2);
            if (currDist < bestDist) {
                [bestWk, bestDist] = [currWk, currDist]; 
            }
        }

        if (JSON.stringify(this.currentPhase.wk) === JSON.stringify(bestWk)) {
            return;
        }
        
        // Find the workload that transitions from the old current to the new bset.
        const key = JSON.stringify([this.currentPhase.wk, bestWk]);
        const newPhase = this.graph.get(key);
        if (newPhase === undefined) {
            throw new Error(`Missing key: ${key}`);
        }
        console.log(`Transitioning to ${key}`);
        this.currentPhase = newPhase;
        this.idx = 0;
    }

    initPhaseGraph(blob: any): Phase {
        const phases = blob["phases"] as Record<string, any>[];
        const samples = blob["runs"]["split"] as Sample[];

        // We record workloads in the following way:
        // Assume the following workload: aba .  In this workload, we want to have
        // transitions from 'a->b', 'b->a', and steady-state loops for 'a' and 'b'.
        //
        // Bench-ds would actually run two copies of each workload next to each other,
        // so we would have `-w aabbaa` in the CLI args.  (Or, in the workload file, or...)
        //
        // The reason why we duplicate each is so that we can trivially deliniate a
        // transition from a steady state trial (this of course assumes that our phase
        // lengths are longer than the time to transition).
        //
        // 1) Workload change: A transition from "a" to "b" is represented by the phase
        //    whose previous phase was 'a' and the current phase is 'b'.
        // 2) Steady state: The data structure remaining in some transition "a" is
        //    represented by the phase whose previous and current phase is 'a'.
        //
        // Note: The very first phase might actually be a transition, depending on whether
        // the uberstructure's starting backing structure matches the first workload, so
        // we disregard it just to be safe.
        for (let i = 1; i < phases.length - 1; i+=2) {
            const steady = Phase.From(phases[i], samples);
            const trans = Phase.From(phases[i+1], samples);

            this.workloads.push(steady.wk);
            this.graph.set(JSON.stringify([steady.wk, steady.wk]), steady);
            this.graph.set(JSON.stringify([steady.wk, trans.wk]), trans);
        }

        // Initialise with the first workload's steady state.
        return(this.graph.get(JSON.stringify([phases[1].workload,phases[1].workload])));
    }

    on(event: "message", f: (s: Sample, wk: Workload) => void) {
        setInterval(() => {
            if (this.currentPhase.samples.length === 0) {
                return;
            }
            f(this.currentPhase.samples[this.idx], this.currentPhase.wk);
        }, 99);      
    }
}

export default CannedSource;