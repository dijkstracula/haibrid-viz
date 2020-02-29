import * as React from 'react';
import * as d3 from 'd3';

interface Props {
    structures: string[]
    actives: string[]
    onChange: (actives: string[]) => void
}

function inputsFromProps(props: Props): JSX.Element[] {
    return props.structures.map((s: string) => {
        const checked = (props.actives.find((a) => a === s) !== undefined)
        return (
            <li>
            <label>
                {s}
                <input 
                    type="checkbox"
                    checked={checked}
                >
                </input>
            </label>
            </li>)
    })
}
export const DataStructureChooser = (props: Props) => {
    return (
        <div>
            {inputsFromProps(props)}
        </div>
    )
}