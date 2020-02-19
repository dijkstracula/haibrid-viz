// TODO: how to share this file between client and server?

export type ClientMsg = "workload";
export type ServerMsg = "sample" | "msg";

export type DataStructure = 
    "rb_tree"         | 
    "sorted_array"    | 
    "stl_hash"        |
    "hs_hash"         | 
    "hs_probe_hash"   | 
    "skiplist"        | 
    "google_btree"    | 
    "linked_hash"     | 
    "dual_btree_hash" | 
    "sorted_set" 
    
export interface Arc {
    ds: DataStructure;
    min: string;
    max: string;
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

export interface Message {
    msg: string;
}

export interface Workload {
    indel: number;
    range: number;
}