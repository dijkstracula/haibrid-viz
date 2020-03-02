// TODO: how to share this file between client and server?

export type ClientMsg = "workload";
export type ServerMsg = "samples" | "message";

export interface Arc {
    min: string;
    max: string;
    type: string; // enum?
};

export interface PolicyEngine {
    credits: number;
};

export interface Sample {
    ds: string,

    // Only defined if ds == split
    // TODO: refactor this
    split_internals?: { 
        arcs: Arc[]
        policy_engine: PolicyEngine
    }

    lat: number;
    ops: number;
    mem: number;
    xput: number;
    ts: number;
    total_ts: number;
};

export class Workload {
    indel = 0
    range = 0
    
    toString(): string { return JSON.stringify(this);}
}