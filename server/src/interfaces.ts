// TODO: how to share this file between client and server?

export type ClientMsg = "workload";
export type ServerMsg = "samples" | "msg";
    
export interface Arc {
    type: string;
    min: string;
    max: string;
};

export interface PolicyEngine {
    credits: number;
};

export interface Sample {
    ds: string;

    // Only defined if ds == split
    // TODO: refactor this
    split_internals?: { 
        arcs: Arc[];
        policy_engine: PolicyEngine;
    };

    lat: number;
    ops: number;
    mem: number;
    xput: number;
    ts: number;
    total_ts: number;
};
export interface Message {
    msg: string;
}

export class Workload {
    indel: number;
    range: number;

    toString(): string { return JSON.stringify(this);}
}