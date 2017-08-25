import { Component, Input, ViewChild, ElementRef, ChangeDetectorRef, ChangeDetectionStrategy } from '@angular/core';

import * as d3 from 'd3-selection';
import * as d3Scale from "d3-scale";
import * as d3Array from "d3-array";
import * as d3Axis from "d3-axis";
import * as d3Time from "d3-time";

// Model
import { Analysis } from '../../model/analysis';

// Services
import { StateService } from '../../services/state.service';

@Component({
  selector: 'timeline',
  templateUrl: './timeline.component.html',
  changeDetection: ChangeDetectionStrategy.Default
})
export class TimelineComponent  {
  @Input() title: string = 'No title!';
  @Input() dataSource: string = 'analyses';
  
  analyses: Array<Analysis> = null;

  width: number;
  height: number;
  margin = {top: 20, right: 20, bottom: 30, left: 40};

  x: any;
  y: any;
  svg: any;
  g: any;

  xScale: any;
  yScale: any;
  xAxis: any;
  yAxis: any;

  constructor(private cd: ChangeDetectorRef, private stateService: StateService) {
    this.width = 900 - this.margin.left - this.margin.right ;
    this.height = 500 - this.margin.top - this.margin.bottom;
    //console.log("this.width: " + this.width);
    //console.log("this.height: " + this.height);
  }

  ngOnInit() {
    console.log ('🔥 Timeline init values: ', this.title, this.dataSource);

    this.stateService[this.dataSource].subscribe(value => {
      if (value) {
          this.analyses = value;
      }
      console.log('🔥 Timeline Details: this.analyses', this.analyses);
    });

    this.initSvg()
    this.initAxis();

    this.makeResponsive();

    this.drawAxis();
    
    this.drawBars();
  }

  initSvg() {

    this.svg = d3.select("#barChart")
        .append("svg")
        .attr("width", '100%')
        .attr("height", '100%')
        .attr('viewBox','0 0 900 500');

    /*
    this.svg = d3.select("svg");
    this.width = +this.svg.attr("width") - this.margin.left - this.margin.right;
    this.height = +this.svg.attr("height") - this.margin.top - this.margin.bottom;
    */
    this.g = this.svg.append("g")
        .attr("transform", "translate(" + this.margin.left + "," + this.margin.top + ")");
  }

  initAxis() {
    this.x = d3Scale.scaleBand().rangeRound([0, this.width]).padding(0.1);
    this.y = d3Scale.scaleLinear().rangeRound([this.height, 0]);
    this.x.domain(this.analyses.map((d) => d.date));
    var maxY = d3Array.max(this.analyses, (d) => {
      return d.dm/100;
    });
    this.y.domain([0, maxY]);

    this.xScale = d3Scale.scaleTime()
    .range([0, this.width])
    .nice(d3Time.timeYear);

    this.yScale = d3Scale.scaleLinear()
    .range([this.height, 0])
    .nice();

    this.xAxis = d3Axis.axisBottom(this.xScale);
    this.yAxis = d3Axis.axisLeft(this.yScale);
  }

  drawAxis() {
    this.g.append("g")
        .attr("class", "axis axis--x")
        .attr("transform", "translate(0," + this.height + ")")
        .call(d3Axis.axisBottom(this.x));
    this.g.append("g")
        .attr("class", "axis axis--y")
        .call(d3Axis.axisLeft(this.y).ticks(10, "%"))
        .append("text")
        .attr("class", "axis-title")
        .attr("transform", "rotate(-90)")
        .attr("y", 6)
        .attr("dy", "0.71em")
        .attr("text-anchor", "end")
        .text("Frequency");
  }

  drawBars() {
    this.g.selectAll(".bar")
        .data(this.analyses)
        .enter().append("rect")
        .attr("class", "bar")
        .attr("x", (d) => this.x(d.date) )
        .attr("y", (d) => { 
          this.y(d.dm/100);
        })
        .attr("width", this.x.bandwidth())
        .attr("height", (d) => this.height - this.y(d.dm/100) );
  }

  makeResponsive () {
    d3.select("#timelineWrapper").on('resize', this.resize); 
  }

  resize () {
    var width = parseInt(d3.select("#barChart").style("width")) - (this.margin.left + this.margin.right);
    var height = parseInt(d3.select("#barChart").style("height")) - (this.margin.top + this.margin.bottom);
    
    /* Update the range of the scale with new width/height */
    /*this.x = d3Scale.scaleBand().rangeRound([0, this.width]).padding(0.1);
    this.y = d3Scale.scaleLinear().rangeRound([this.height, 0]);
    xScale.range([0, width]).nice(d3.time.year);
    yScale.range([height, 0]).nice();*/
    
    /* Update the axis with the new scale */
    this.g.select('.x.axis')
      .attr("transform", "translate(0," + height + ")")
      .call(this.xAxis);
    
    this.g.select('.y.axis')
      .call(this.yAxis);
    
    /* Force D3 to recalculate and update the line */
    this.g.selectAll('.bar')
      .attr("d", this.svg.line());
  }
}
