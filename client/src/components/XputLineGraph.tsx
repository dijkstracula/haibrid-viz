import * as React from 'react';
import * as d3 from 'd3';
import { Sample } from '../interfaces';
import * as helpers from './helpers';

interface Props {
    samples: Sample[]
    actives: string[]
}

function groupByDS(samples: Sample[]): Map<string, Sample[]> {
  let map = new Map<string, Sample[]>()

  for (let s of samples) {
    const ds = s.ds
    let samples = map.get(ds)
    if (samples === undefined) {
      map.set(ds, [])
    } else {
      samples.push(s)
    }
  }

  return map
}

export const XputLineGraph = (props: Props) => {
  const svg_root = React.useRef() as React.MutableRefObject<any>; //TODO: ugh
  const svg_chart = React.useRef() as React.MutableRefObject<any>; //TODO: ugh
  const svg_x_axis = React.useRef() as React.MutableRefObject<any>; //TODO: ugh
  const svg_y_axis = React.useRef() as React.MutableRefObject<any>; //TODO: ugh

  const margin = {top: 20, right: 50, bottom: 20, left: 50}
  const width = 640 - margin.left - margin.right
  const height = 300 - margin.top - margin.bottom

  let x = d3.scaleLinear().range([0, width - margin.right - 20])
  let y = d3.scaleLog().base(10).range([height, 32])

  React.useEffect(() => {
    x.domain([0, 50])
    y.domain([
        d3.min(
          props.samples.filter((s) => props.actives.find((a) => a === s.ds)), 
          (s) => s.xput
        ) as number
      , 
      d3.max(
        props.samples.filter((s) => props.actives.find((a) => a === s.ds)), 
        (s) => s.xput
      ) as number
    ])
    .nice()

    // Draw axes
    d3.select(svg_x_axis.current)
      .call(d3.axisBottom(x).tickFormat((x) => ""));
    d3.select(svg_y_axis.current)
      .call(d3.axisLeft(y));

    // Label axes

    const line = d3.line<Sample>()
      .x((_,i) => x(i))
      .y((s) => y(s.xput))

    d3.select(svg_chart.current)
      .selectAll("path")
      .remove()
    d3.select(svg_chart.current)
      .selectAll("text")
      .remove()

    const map = groupByDS(props.samples)
    for (let ds of Array.from(map.keys())) {
      const samples = map.get(ds) as Sample[]
      if (samples === undefined || samples.length === 0) {
        continue
      }
      if (props.actives.find((a) => a === ds) === undefined) {
        continue
      }

      d3.select(svg_chart.current)
        .append("path")
        .datum(samples)
        .attr("class", "line")
        .attr("d", line)
        .attr("stroke", helpers.colour_for_ds(ds))
        .attr("stroke-dasharray", helpers.stroke_dasharray_for_ds(ds))
        .attr("stroke-linejoin", "round")
        
      const avg_xput = samples.slice(samples.length - 5, samples.length)
        .map((s) => s.xput)
        .reduce((p, c) => p+c) / 5

      d3.select(svg_chart.current)
        .append("text")
        .attr("transform", "translate(" + x(50) + "," + (50 * y(avg_xput))/50 + ")")
        .attr("dy", ".35em")
        .attr("text-anchor", "start")
        .attr("fill", helpers.colour_for_ds(ds))
        .text(helpers.name_for_ds(ds))
    }

    d3.select(svg_chart.current)
      .exit()
      .remove()
  },
  [props, svg_root.current])

  return (
    <div>
      <svg width={width + margin.left + margin.right} 
           height={height + margin.top + margin.bottom} 
           ref={svg_root} >
        <svg>
          <g ref={svg_chart} transform={`translate(${margin.left}, ${margin.top})`}/>
          <g ref={svg_x_axis} transform={`translate(${margin.left}, ${height})`}>
          </g>
          <g ref={svg_y_axis} transform={`translate(${margin.left}, 0)`}>
          </g>
        </svg>
      </svg>
    </div>
  )
}