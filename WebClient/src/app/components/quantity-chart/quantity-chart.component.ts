import { Component, AfterViewInit, Injectable, OnInit } from '@angular/core';
import * as d3 from 'd3';
import { QuantityService, VisitAnalytics } from '../../services/quantity.service';


@Component({
  selector: 'app-quantity-chart',
  imports: [],
  templateUrl: './quantity-chart.component.html',
  styleUrl: './quantity-chart.component.css'
})



export class QuantityChartComponent implements AfterViewInit, OnInit {
  items: VisitAnalytics[]= [];
  visitLabels="";
  visitData=0;
  constructor(private qs: QuantityService) {}

  ngOnInit(){
    this.qs.getItems().subscribe({
      next: (data: VisitAnalytics[]) => {
        console.log('Typed data:', data);
        console.log("T");
        this.items=data;
        console.log(this.items);
        this.createBarChart(data)
      },
      error: (err) => {
        console.error('Error fetching visit data:', err);
      }
    });
  }
  ngAfterViewInit(): void {
  }

  private createBarChart(data: VisitAnalytics[]): void {
    const svg = d3.select("#chart")
      .append("svg")
      .attr("width", 600)
      .attr("height", 400);

    const margin = { top: 20, right: 30, bottom: 40, left: 50 };
    const width = +svg.attr("width") - margin.left - margin.right;
    const height = +svg.attr("height") - margin.top - margin.bottom;

    const chart = svg.append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    const x = d3.scaleBand()
      .domain(data.map(d => d.name))
      .range([0, width])
      .padding(0.2);

    const y = d3.scaleLinear()
      .domain([0, d3.max(data, d => d.totalQuantity)!])
      .range([height, 0]);

    chart.selectAll("rect")
      .data(data)
      .enter()
      .append("rect")
      .attr("x", d => x(d.name)!)
      .attr("y", d => y(d.totalQuantity))
      .attr("width", x.bandwidth())
      .attr("height", d => height - y(d.totalQuantity))
      .attr("fill", "steelblue");

    chart.append("g")
      .attr("transform", `translate(0,${height})`)
      .call(d3.axisBottom(x));

    chart.append("g")
      .call(d3.axisLeft(y));
      svg.append("text")
      .attr("x", width / 2)
      .attr("y", height + margin.bottom+20)
      .attr("text-anchor", "middle")
      .style("font-size", "14px")
      .text("Product Name");
  
      svg.append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", -margin.left + 15) // Push right from left edge
      .attr("x", -height / 2)       // Center vertically
      .attr("dy", "1em")            // Adjust vertical alignment
      .attr("text-anchor", "middle")
      .style("font-size", "14px")
      .text("Total $");
  }

}
