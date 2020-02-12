import * as React from 'react';
import { Component } from 'react';
import * as d3 from 'd3';
import { Sample } from '../sample';
import { svg } from 'd3';

interface Props {
    samples: Sample[];
}

function mostRecentSample(samples: Sample[]): Sample | undefined {
  if (samples.length > 0) {
    return samples[samples.length - 1]
  }
  return undefined
}


/*
export class LatencyLineGraph extends Component<Props, {}> {
  margin = {top: 20, right: 20, bottom: 50, left: 50}
  width = 640 - this.margin.left - this.margin.right
  height = 480 - this.margin.top - this.margin.bottom

  svgref: SVGSVGElement | null = null //TODO: type???

  line = d3.line<Sample>()
    .x((_,i) => i)
    .y((s) => s.lat)

  componentDidMount() {
    this.init()
    this.draw()
  }

  componentDidUpdate() {
    this.draw()
  }

  init() {
    let svg = d3.select(this.svgref)
      .attr("transform",`translate(${this.margin.left}, ${this.margin.top})`)

    // Add the X Axis
    svg
      .append("g")
      .attr('transform', `translate(0, ${this.height})`)
      .call(d3.axisBottom(this.x));

    // Add the Y Axis
    svg
      .append("g")
      .attr('transform', `translate(0, 0)`)
      .call(d3.axisLeft(this.y));
  }


  draw() {
    let svg = d3.select(this.svgref)

    let x = d3.scaleLinear().range([0, this.width])
    let y = d3.scaleLinear().range([this.height, 0])

    this.x.domain([0, this.props.samples.length]).nice()
    this.y.domain([0, d3.max(this.props.samples, (s) => s.lat) as number]).nice()

    svg.append("path")
      .data([this.props.samples])
      .attr("class", "line")
      .attr("d", this.line)
  }

  render() {
    return (
      <svg
        width={this.width + this.margin.left + this.margin.right}
        height={this.height + this.margin.bottom + this.margin.top}
        ref={(e) => this.svgref = e as SVGSVGElement}>
      </svg>
    )
  }
}
*/


export const LatencyLineGraph = (props: Props) => {


  const svg_root = React.useRef() as React.MutableRefObject<any>; //TODO: ugh
  const svg_chart = React.useRef() as React.MutableRefObject<any>; //TODO: ugh
  const svg_x_axis = React.useRef() as React.MutableRefObject<any>; //TODO: ugh
  const svg_y_axis = React.useRef() as React.MutableRefObject<any>; //TODO: ugh

  const margin = {top: 20, right: 20, bottom: 50, left: 50}
  const width = 640 - margin.left - margin.right
  const height = 480 - margin.top - margin.bottom

  let x = d3.scaleLinear().range([0, width])
  let y = d3.scaleLinear().range([height, 0])

  React.useEffect(() => {

    x.domain([0, 50]).nice()
    y.domain([0, d3.max(props.samples, (s) => s.lat) as number]).nice()

    d3.select(svg_x_axis.current)
      .call(d3.axisBottom(x));
    d3.select(svg_y_axis.current)
      .call(d3.axisLeft(y));

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
          <g ref={svg_x_axis} transform={`translate(${margin.left}, ${height})`} />
          <g ref={svg_y_axis} transform={`translate(${margin.left}, 0)`} />
        </svg>
      </svg>
    </div>
  )
}