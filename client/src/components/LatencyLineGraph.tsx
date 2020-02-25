import * as React from 'react';
import * as d3 from 'd3';
import { Sample } from '../interfaces';

interface Props {
    samples: Sample[];
}

export const LatencyLineGraph = (props: Props) => {


  const svg_root = React.useRef() as React.MutableRefObject<any>; //TODO: ugh
  const svg_chart = React.useRef() as React.MutableRefObject<any>; //TODO: ugh
  const svg_x_axis = React.useRef() as React.MutableRefObject<any>; //TODO: ugh
  const svg_y_axis = React.useRef() as React.MutableRefObject<any>; //TODO: ugh

  const margin = {top: 20, right: 20, bottom: 20, left: 50}
  const width = 640 - margin.left - margin.right
  const height = 300 - margin.top - margin.bottom

  let x = d3.scaleLinear().range([0, width])
  let y = d3.scaleLinear().range([height, 0])

  React.useEffect(() => {

    x.domain([0, 50]).nice()
    y.domain([0, d3.max(props.samples, (s) => s.lat) as number]).nice()

    // Draw axes
    d3.select(svg_x_axis.current)
      .call(d3.axisBottom(x));
    d3.select(svg_y_axis.current)
      .call(d3.axisLeft(y));

    // Label axes

    d3.select(svg_x_axis.current)  
      .append("text")          
      .attr("transform",
            "translate(" + (width/2) + " ," + 
                           (height + margin.top + 20) + ")")
      .style("text-anchor", "middle")
      .text("Date");

    const line = d3.line<Sample>()
      .x((_,i) => x(i))
      .y((s) => y(s.lat))

    d3.select(svg_chart.current)
      .select("path")
      .remove()

    d3.select(svg_chart.current)
      .append("path")
      .datum(props.samples)
      .transition()
      .attr("class", "line")
      .attr("d", line)

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