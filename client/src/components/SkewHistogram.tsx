import * as React from 'react';
import * as d3 from 'd3';
import { svg, randomExponential } from 'd3';

interface Props {
    alpha: number
}

export const SkewHistogram = (props: Props) => {
  const svg_root = React.useRef() as React.MutableRefObject<any>; //TODO: ugh
  const slider = React.useRef() as React.MutableRefObject<any>; //TODO: ugh

  const buckets = 25;
  const width = 300
  const height = 200

  React.useEffect(() => {
    const data = Array.from(Array(buckets)).map<number>((_,i) => {
        return Math.pow(i+1, -props.alpha)
    })

    let x = d3.scaleLinear()
        .range([0, width])
        .domain([0,data.length])

    let y = d3.scaleLinear()
        .range([height, 0])
        .domain([0,1])

    let svg = d3.select(svg_root.current)

    svg.select("rect").transition().style("fill", "red");

    // Remove and re-insert elements.
    svg.selectAll("rect")
        .remove()
        .exit()
        .data(data)
        .enter()
        .append("rect")
        .attr('x', (_,i) => x(i))
        .attr('y', (d) => y(d))
        .attr('width', (width/buckets) - 2)
        .attr('height', (d) => d * height)

    const animate_zipf_sample = () => {
      console.log("Histogram: " + props.alpha)

      const r = d3.randomUniform(1,buckets)()
      let bucket = 0
      let sum = 0
      for (var i = 1; i < 100 && bucket < buckets; i++) {
        if (sum > r) {
          break
        }
        sum += Math.pow(i, (props.alpha))
        bucket += 1
      }

      svg.select(`rect:nth-child(${bucket-1})`)
      .style("fill", "red")
      .transition()
      .style("fill", "blue")
      .on("end", animate_zipf_sample)
    }
    animate_zipf_sample()

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