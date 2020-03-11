import * as React from 'react';
import * as d3 from 'd3';
import * as helpers from './helpers'

interface Props {
    structures: string[]
    actives: string[]
    onChange: (actives: string[]) => void
}

function inputsFromProps(props: Props): JSX.Element[] {
    let actives = new Set<string>(props.actives)
    return props.structures.map((s: string) => {
        return (
            <li>
            <label>
                {helpers.name_for_ds(s)}
                <input 
                    type="checkbox"
                    checked={actives.has(s)}
                    onChange={(e) => {
                        if (e.target.checked) {
                            actives.add(s)
                        } else {
                            actives.delete(s)
                        }
                        props.onChange(Array.from(actives.values()))
                    }}
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
