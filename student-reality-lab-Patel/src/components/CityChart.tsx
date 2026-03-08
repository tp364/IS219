import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import { loadData } from '../lib/loadData';
import { ProcessedRecord } from '../lib/schema';

export default function CityChart() {
  const svgRef = useRef<SVGSVGElement>(null);
  const [year, setYear] = useState<number | null>(null);
  const [data, setData] = useState<ProcessedRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadData()
      .then(d => {
        console.log('loaded data', d);
        setData(d);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setError('Failed to load data');
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    if (!data.length || !svgRef.current) return;

    const filtered: ProcessedRecord[] = data.filter(d => d.year === year);
    const width = 800;
    const height = 400;
    const margin = { top: 20, right: 20, bottom: 40, left: 120 };

    const svg = d3.select(svgRef.current);
    const tooltip = d3.select('#tooltip');
    svg.selectAll('*').remove();

    const x = d3.scaleLinear()
      .domain([0, d3.max(filtered, (d: ProcessedRecord) => d.price_to_income)! * 1.1])
      .range([margin.left, width - margin.right]);

    const y = d3.scaleBand()
      .domain(filtered.map((d: ProcessedRecord) => d.region))
      .range([margin.top, height - margin.bottom])
      .padding(0.1);

    svg.append('g')
      .attr('transform', `translate(0,${margin.top})`)
      .call(d3.axisTop(x));

    svg.append('g')
      .attr('transform', `translate(${margin.left},0)`)
      .call(d3.axisLeft(y));

    // color scale from green (<=5) to red (>=8) with interpolation
    const color = d3.scaleSequential(d3.interpolateRdYlGn)
      .domain([8, 3]); // invert so low ratio is green

    svg.selectAll('rect')
      .data(filtered)
      .enter()
      .append('rect')
      .attr('x', margin.left)
      .attr('y', (d: ProcessedRecord) => y(d.region)!)
      .attr('width', (d: ProcessedRecord) => x(d.price_to_income) - margin.left)
      .attr('height', y.bandwidth())
      .attr('fill', (d: ProcessedRecord) => {
        if (d.price_to_income > 5) return '#e53935';              // unaffordable
        if (d.price_to_income >= 4 && d.price_to_income <= 5) return '#ffa726'; // maybe
        return color(d.price_to_income);                         // gradient for affordable
      })
      .attr('stroke', 'none')
      .attr('stroke-width', 0)
      .on('mouseover', function(event, d) {
        const [mx, my] = d3.pointer(event);
        tooltip
          .style('left', mx + 15 + 'px')
          .style('top', my + 'px')
          .style('opacity', 1)
          .html(`${d.region}<br/>Ratio: ${d.price_to_income.toFixed(2)}`);
      })
      .on('mouseout', () => tooltip.style('opacity', 0));

    // add numeric labels inside bars or just outside if too narrow
    svg.selectAll('text.value')
      .data(filtered)
      .enter()
      .append('text')
      .attr('class', 'value')
      .attr('x', (d: ProcessedRecord) => {
        const widthBar = x(d.price_to_income) - margin.left;
        // if bar wide enough put inside, else outside
        return margin.left + (widthBar > 40 ? widthBar - 5 : widthBar + 5);
      })
      .attr('y', (d: ProcessedRecord) => y(d.region)! + y.bandwidth() / 2)
      .attr('dy', '0.35em')
      .text((d: ProcessedRecord) => d.price_to_income.toFixed(2))
      .attr('font-size', '10px')
      .attr('text-anchor', (d: ProcessedRecord) => {
        const widthBar = x(d.price_to_income) - margin.left;
        return widthBar > 40 ? 'end' : 'start';
      })
      .attr('fill', (d: ProcessedRecord) => {
        const widthBar = x(d.price_to_income) - margin.left;
        // choose white if inside colored area and the background is dark
        return widthBar > 40 ? '#fff' : '#000';
      });


    // annotation example: highlight bottom region (removed per request)

    // legend
    const legendHeight = 10;
    const legendWidth = 200;
    const legendData = [3, 5, 8];
    const legendScale = d3.scaleLinear().domain([3,8]).range([0, legendWidth]);
    const defs = svg.append('defs');
    const gradient = defs.append('linearGradient').attr('id','grad');
    gradient.append('stop').attr('offset','0%').attr('stop-color', color(3));
    gradient.append('stop').attr('offset','100%').attr('stop-color', color(8));
    svg.append('rect')
      .attr('x', margin.left)
      .attr('y', height - margin.bottom + 10)
      .attr('width', legendWidth)
      .attr('height', legendHeight)
      .style('fill','url(#grad)');
    svg.append('text').attr('x', margin.left).attr('y', height - margin.bottom + 30).text('low').attr('font-size','10px');
    svg.append('text').attr('x', margin.left+legendWidth-20).attr('y', height - margin.bottom + 30).text('high').attr('font-size','10px');

  }, [data, year]);

  // ensure years is a number[] to satisfy TS
  const years = (Array.from(new Set(data.map((d: ProcessedRecord) => +d.year))) as number[]).sort();

  // set initial year when data arrives
  useEffect(() => {
    if (years.length && year === null) {
      setYear(years[years.length - 1]); // default to most recent year
    }
  }, [years, year]);

  if (loading) {
    return <p>Loading data…</p>;
  }
  if (error) {
    return <p>{error}</p>;
  }
  if (!years.length || year === null) {
    return <p>No data available.</p>;
  }

  return (
    <div className="chart-container" style={{position: 'relative'}}>
      <div className="tooltip" id="tooltip"></div>
      <h2>Price-to-Income Ratio by Region ({year})</h2>
      <p>
        The bar chart below shows how many years of the typical household income it
        would take to cover the median home price in each metro.  Green bars
        indicate areas where a graduate earning the median income could theoretically
        save up enough in five years; red bars mark places where the goal would
        require more than five years of income (ignoring taxes, debt service, and
        other costs).
      </p>
      <div className="controls">
        <label>
          Year: 
          <input
            type="range"
            aria-label="Year selector"
            min={Math.min(...years)}
            max={Math.max(...years)}
            value={year}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setYear(+e.target.value)}
          />
          {year}
        </label>
      </div>
      <svg ref={svgRef} width={800} height={400}></svg>
      <p>
        Bars colored green are affordable (&lt;5 years of median income); red bars indicate ratios &gt;5.
      </p>
    </div>
  );
}
