import * as React from 'react';
import * as d3 from 'd3';
import { Arc } from '../interfaces';
import * as helpers from './helpers'


interface Props {
    arcs: Arc[]
}

export const ArcsetHistogram = (props: Props) => {
  const svg_root = React.useRef() as React.MutableRefObject<any>; //TODO: ugh

  const width = 640
  const height = 100


  //TODO: the sandwich workload script sohuld emit N and s
  const s = 1         // spacing between keys
  const N = 2.5*10**7   // number of keys
  const max_key = 18446744073709551615

  React.useEffect(() => {
    if (props.arcs.length === 0) {
      return
    }
    // Disgusting hack because of "reasons" we don't know
    // the arc's actual size, but we do know the number of
    // elements in the data structure and the interval btw
    // each of them, so space them out here.  But, we have
    // to special-case the final datapoint, since it doesn't
    // refer to an actual element but points to the end of
    // the keyspace entirely.
    const data: {size: number, type: string}[] = props.arcs.map((a: Arc) => {
      const absolute = Number.parseInt(a.max)
      return {
        "type": a.type,
        "size": (absolute/N) * s
      }
    })
    data[data.length - 1].size = 1

    // Sort the relative lengths so we can painters-algorithm
    // them back-to-front onto the screen.
    data.sort((a,b) => b.size-a.size)
      
    let x = d3.scaleLinear()
      .domain([0, 1])
      .range([0, width])

    let svg = d3.select(svg_root.current)

    // Remove and re-insert elements.
    svg.selectAll("rect")
      .remove()
      .exit()
      .data(data)
      .enter()
      .append("rect")
      .attr('width', (d) => x(d.size))
      .attr('y', 0)
      .attr('height', 20)
      .attr('fill', (d) => helpers.colour_for_ds(d.type))
      
    
    svg.selectAll("text")
      .remove()
      .exit()
      .data(data)
      .enter()
      .append("text")
      .text((d) => helpers.name_for_ds(d.type))
      .attr('x', (d) => Math.min(x(d.size), width) - 80)
      .attr('y', 10)
     // .style("text-align", "right")
      .attr("fill", "white")

          // axis

    svg.selectAll("g")
    .remove()
    .exit()

  svg.append("g")
    .attr("transform", `translate(0, ${20})`)
    .call(d3.axisBottom(x).ticks(10).tickFormat(((i) => `${i.valueOf() * 100}%` )))
 
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
