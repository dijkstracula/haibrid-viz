// A source emits samples.
import * as fs from "fs";
import EventEmitter from "events";
import * as sample from "./sample";

class CannedSource {
    public samples: sample.Sample[]
    idx: number

    constructor(path: string) {
        this.samples = JSON.parse(fs.readFileSync(path, "utf8"));
        this.idx = 0;
        
        setInterval(() => {
            console.log(this.idx);
            this.idx = (this.idx + 1) % this.samples.length;
        }, 99);
    }

    on(event: "message", f: (sample: sample.Sample) => void) {
        setInterval(() => {
            f(this.samples[this.idx]);
        }, 99);      
    }
}

export default CannedSource;