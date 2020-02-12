// TODO: how to share this file between client and server?

export interface Arc {
    min: string;
    max: string;
    type: string; // enum?
};

export interface PolicyEngine {
    credits: number;
};

export interface Sample {
    arcs: Arc[];
    policy_engine: PolicyEngine;
    lat: number;
    ops: number;
    mem: number;
    xput: number;
    ts: number;
    total_ts: number;
};