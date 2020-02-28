// A source emits samples.
import * as fs from "fs";
import {Sample, Workload, Arc} from "./interfaces";

export class SampleIterator {
    public ds: string
    samples: Sample[]
    idx = 0

    constructor(ds: string, samples: Sample[]) {
        this.ds = ds;
        this.samples = samples;
        samples.forEach((s) => {
            s.ds = ds; //TODO: this seems slightly silly, I donno.
        });
    }

    reset() {
        this.idx = 0;
    }

    next(): boolean {
        if (this.idx === this.samples.length - 1) {
            return false;
        } else {
            ++this.idx;
            //console.log(`${this.ds}: ${this.idx}`);
            return true;
        }
    }

    get(): Sample {
        return this.samples[this.idx];
    }
}

// A Phase comprises a set of Samples, either representing a transition from
// some structure to another, or the steady-state of a particular workload.
class Phase {
    begin: number
    end: number
    name: string
    wk: Workload
    iterators: SampleIterator[]

    toString(): string { return JSON.stringify(this);}

    static From(objblob: any, runs: Record<string, Sample[]>): Phase {
        const begin: number = objblob["begin"];
        const end: number = objblob["end"];
        const name: string = objblob["name"];
        const wk: Workload = objblob["workload"];
        const iterators: SampleIterator[] = [];
        
        // TODO: we should bsearch.  Ah well.
        for (const ds in runs) {
            const s = runs[ds] as Sample[];
            const b = s.findIndex((s) => s.total_ts >= begin);
            const e = s.findIndex((s) => s.total_ts >= end);

            iterators.push(new SampleIterator(ds, s.slice(b,e)));
        }
        
        return {
            begin, end, name, wk, iterators: iterators
        };
    }
}

export class CannedSource {
    currentPhase: Phase
    workloads: Workload[] = []
    graph: Map<string, Phase> = new Map<string, Phase>();

    nextPhase() {
        // If we have exhausted the current phase's samples,
        // transition to the steady state for this workload.

        // Need to stringify for deep object comparision, ugh!
        const key = JSON.stringify([this.currentPhase.wk, this.currentPhase.wk]);
        this.currentPhase = this.graph.get(key);
        if (this.currentPhase === undefined) {
            throw new Error(`Missing key: ${key}`);
        }        
        console.log(`Transitioning to ${key} (finished)`);
        this.currentPhase.iterators.forEach((i) => i.reset());
    }
    constructor(path: string) {
        console.log("Reading workload blob at " + path);
        const blob = JSON.parse(fs.readFileSync(path, "utf8"));

        console.log("Initing phase graph...");
        this.currentPhase = this.initPhaseGraph(blob);

        console.log("Registering transition callback...");
        setInterval(() => {
            for (const it of this.currentPhase.iterators) {
                const incomplete = it.next();

                // The phases might not all have the same length; with a long recording,
                // perhaps a bit of jitter was inserted over time.  We jump to the next
                // phase the moment the first iterator runs dry.
                if (!incomplete) {
                    this.nextPhase();
                    return;
                }
            }
        }, 99);
    }

    updateWorkload(w: Workload) {
        let bestWk = this.workloads[0];
        let bestDist = Number.MAX_SAFE_INTEGER;

        for (const i in this.workloads) {
            const currWk = this.workloads[i];
            const currDist = Math.sqrt(
                (currWk.indel - w.indel)**2 + 
                (currWk.range - w.range)**2);
            if (currDist < bestDist) {
                [bestWk, bestDist] = [currWk, currDist]; 
            }
        }

        // Deep equality check, l o l
        if (JSON.stringify(this.currentPhase.wk) === JSON.stringify(bestWk)) {
            return;
        }
        
        // Find the workload that transitions from the old current to the new bset.
        const key = JSON.stringify([this.currentPhase.wk, bestWk]);
        const newPhase = this.graph.get(key);
        if (newPhase === undefined) {
            throw new Error(`Missing key: ${key}`);
        }
        console.log(`Transitioning to ${key} (update)`);
        this.currentPhase = newPhase;
        this.currentPhase.iterators.forEach((i) => i.reset());
    }

    initPhaseGraph(blob: any): Phase {
        const phases = blob["phases"] as Record<string, Phase>[];
        const runs = blob["runs"] as Record<string, Sample[]>; // l o l

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
            const steady = Phase.From(phases[i], runs);
            const trans = Phase.From(phases[i+  1], runs);

            this.workloads.push(steady.wk);
            this.graph.set(JSON.stringify([steady.wk, steady.wk]), steady);
            this.graph.set(JSON.stringify([steady.wk, trans.wk]), trans);
        }

        // Initialise with the first workload's steady state.
        return(this.graph.get(JSON.stringify([phases[1].workload,phases[1].workload])));
    }

    on(event: "message", f: (its: SampleIterator[], wk: Workload) => void) {
        setInterval(() => {
            const wk = this.currentPhase.wk;
            f(this.currentPhase.iterators, wk);
        }, 99);      
    }
}