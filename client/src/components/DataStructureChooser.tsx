import * as React from 'react';
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
            <div>
            <label>
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
                {helpers.name_for_ds(s)}
            </label>
            </div>)
    })
}
export const DataStructureChooser = (props: Props) => {
    return (
        <div className="container flex-direction=row">
            {inputsFromProps(props)}
        </div>
    )
}
