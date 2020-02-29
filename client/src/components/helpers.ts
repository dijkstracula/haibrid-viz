import * as d3 from 'd3';

export function name_for_ds(ds: string) {
    switch (ds) {
        case "split":
            return "HAIbrid"
        case "hs_hash":
            return "hash table"
        case "google_btree":
            return "B-tree"
        case "skiplist":
            return "skip list"
    }
    return "???"
}
export function colour_for_ds(ds: string) {
    switch (ds) {
        case "split":
            return "#00cccc"
        case "hs_hash":
            return "#008000"
        case "google_btree":
            return "#808000"
        case "skiplist":
            return "#008080"
    }
    return "#FF0000"
}

export function stroke_dasharray_for_ds(ds: string) {
    if (ds === "split") {
        return "0"
    }
    else {
        return "3"
    }
}