// A source emits samples.
import * as fs from "fs";
import EventEmitter from "events";
import {Sample} from "./sample";

class CannedSource {
    public samples: Sample[]
    idx: number

    constructor(path: string) {
        this.samples = JSON.parse(fs.readFileSync(path, "utf8"))["runs"]["split"] as Sample[];
        this.idx = 0;
        
        setInterval(() => {
            console.log(this.idx);
            this.idx = (this.idx + 1) % this.samples.length;
        }, 99);
    }

    on(event: "message", f: (sample: Sample) => void) {
        setInterval(() => {
            if (this.samples.length === 0) {
                return;
            }
            f(this.samples[this.idx]);
        }, 99);      
    }
}

export default CannedSource;