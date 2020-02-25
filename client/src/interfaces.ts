// TODO: how to share this file between client and server?

export type ClientMsg = "workload";
export type ServerMsg = "sample";

export interface Arc {
    min: string;
    max: string;
    type: string; // enum?
};

export interface PolicyEngine {
    credits: number;
};

export interface Sample {
    ds_split: { arcs: Arc[] }
    policy_engine: PolicyEngine;
    lat: number;
    ops: number;
    mem: number;
    xput: number;
    ts: number;
    total_ts: number;
};

export interface Workload {
    indel: number;
    range: number;
    alpha: number; 
}