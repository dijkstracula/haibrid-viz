import * as React from 'react';
import * as d3 from 'd3';
import { Workload } from '../interfaces';

type Changed = "indel" | "range"

interface Props {
    workload: Workload
    onChange: (workload: Workload) => void
}

export const WorkloadSliders = (props: Props) => {

    const onIndelUpdate = (indel: number) => {
        let range = props.workload.range
        let reads = 1 - (indel + range)
        if (reads < 0) {
            reads = 0;
            range = 1 - indel
        }
        //TODO: onChange something like react's setState?
        props.onChange({indel: indel, range: range})
    }

    const onRangeUpdate = (range: number) => {
        let indel = props.workload.indel
        let reads = 1 - (indel + range)
        if (reads < 0) {
            reads = 0;
            indel = 1 - range;
        }
        //TODO: onChange something like react's setState?
        props.onChange({indel: indel, range: range})
    }

    return (
        <div className="container flex-direction=column">
            <div>
                indel
                <input type="range" min="0.0" max="1.0" step="0.25" 
                    value={props.workload.indel}
                    onChange={(e) => onIndelUpdate(e.target.valueAsNumber)} />
            </div>
            <div>
                range
                <input type="range" min="0.0" max="1.0" step="0.25" 
                    value={props.workload.range}
                    onChange={(e) => onRangeUpdate(e.target.valueAsNumber)} />
            </div>
            <div>
                reads
                <input type="range" min="0.0" max="1.0" step="0.25" 
                    value={1 - (props.workload.range + props.workload.indel)}/>
            </div>
        </div>
    )
}
