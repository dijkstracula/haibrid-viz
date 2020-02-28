import * as React from 'react';
import * as d3 from 'd3';
import { Arc } from '../interfaces';

interface Props {
    arcs: Arc[]
}

export const ArcsetHistogram = (props: Props) => {
  const svg_root = React.useRef() as React.MutableRefObject<any>; //TODO: ugh

  const width = 300
  const height = 200

  React.useEffect(() => {
    if (props.arcs === undefined) {
      return
    }

    const data = props.arcs.map((a: Arc) => {
        return Math.log10(Number.parseInt(a.max) - Number.parseInt(a.min))
      })
      
    let x = d3.scaleBand()
      .range([0, width])
      .padding(0.1)

    let y = d3.scaleLinear()
      .range([0, height])
      .domain([0,Math.max(...data)])

    let svg = d3.select(svg_root.current)
    svg.select("rect").transition().style("fill", "red");

    // Remove and re-insert elements.
    svg.selectAll("rect")
      .remove()
      .exit()
      .data(data)
      .enter()
      .append("rect")
      .attr('width', x.bandwidth)
      .attr('y', 0)
      .attr('width', (width/2) - 2)
      .attr('height', (d) => y(d))

        /*
    svg
    .remove()
    .exit()
    .data(props.arcs)
    .enter()
        .append('svg')
        .append('text')
        .attr('x', (_,i) => i)
        .attr("dy", "1.2em")
        .text((a) => a.type)
        .style("fill", "#ffffff")
        */
  },
  [props])

  return (
    <div>
      <svg width={width} 
           height={height} 
           ref={svg_root} >
      </svg>
    </div>
  )
}