import { Component, ViewEncapsulation, OnInit } from '@angular/core';
import { Observable } from "rxjs";
import 'rxjs/add/observable/interval';
import { Subscription } from 'rxjs/Subscription';

import * as d3 from 'd3';
import * as d3Scale from 'd3-scale';
import * as d3Shape from 'd3-shape';
import * as d3Array from 'd3-array';
import * as d3Axis from 'd3-axis';
import * as d3Time from 'd3-time-format';

import { Station } from '../../station';
import { Dock } from '../../dock';

import { PlacesService } from '../../places.service';
import { VERSION } from '@angular/material';

@Component({
    selector: 'app-real-time-sma-line-chart',
    encapsulation: ViewEncapsulation.None,
    templateUrl: './real-time-sma-line-chart.component.html',
    styleUrls: ['./real-time-sma-line-chart.component.css']
})
export class RealTimeSMALineComponent implements OnInit {

    /////////////////////////////////////////////////////
    /////////////////////////////////////////////////////


    /////////////     ADD YOUR CODE HERE      ///////////



    // Write your code SIMILAR to real-time-chart component
    // real-time-sma-line-chart.component.html MUST BE UPDATED as well
    // Done Update list-of-stations.component.ts by adding somtehing similar to getLineChart(stationName)
    // Done Update list-of-stations.component.html by adding somtehingsimilar to (click)="getLineChart(element.stationName)


    /////////////////////////////////////////////////////
    /////////////////////////////////////////////////////
    private margin = {top: 50, right: 20, bottom: 30, left: 150};
    private width: number;
    docks: Dock[];
    timeRangeSelected: string;

    stationSelected:Station;
    value:number;
    SMALineChart:Subscription;
    LineChart: Subscription;
    stationNameSelected: string;
    title: string;
    padding = 1;


    timeRanges = [
       { id : '1 HOUR', value: 'Past Hour'},
       { id : '24 HOUR', value: 'Last 24 Hours'},
       { id : '7 DAY', value: 'Last 7 Days'}
     ];

    private height: number;
    private x: any;
    private y: any;
    private svg: any;
    private line: d3Shape.Line<[number, number]>;

    private movingAverageLine1: d3Shape.Line<[number, number]>;
    private movingAverageLine: d3Shape.Line<[number, number]>;
    version = VERSION;


    ///////////////////////////////////////////////////////////////////////
    ///////////////////////////////////////////////////////////////////////

    constructor(private placesService: PlacesService) {
        this.width = 900 - this.margin.left - this.margin.right;
        this.height = 500 - this.margin.top - this.margin.bottom;
    }

    ngOnInit() {
      debugger;
     if (this.SMALineChart !== undefined) {
              this.SMALineChart.unsubscribe();
     }

     this.timeRangeSelected ="1 HOUR";
     this.stationNameSelected = this.placesService.stationNameSelected;
     this.title = 'Divvy Dock Station:    ' + this.stationNameSelected;

    }


   ///////////////////////////////////////////////////////////////////////
   ///////////////////////////////////////////////////////////////////////


   changeTimeRangeSelected(data){
     debugger;
       this.build_d3_chart('#008000',0,this.timeRangeSelected);
   }






   ///////////////////////////////////////////////////////////////////////
   ///////////////////////////////////////////////////////////////////////


   build_d3_chart(color,value,type){
     debugger;
     this.placesService.getStationSelected().subscribe((data: Station) => {
          this.stationSelected = data;
          this.create_d3_chart(this.stationSelected.stationName,this.placesService,this.timeRangeSelected);
     });

   }


   ///////////////////////////////////////////////////////////////////////
   ///////////////////////////////////////////////////////////////////////


   create_d3_chart(stationName,placesService,timeRange) {
     debugger;
     if (this.SMALineChart !== undefined) {
              this.SMALineChart.unsubscribe();
     }

     this.stationNameSelected = stationName;
     this.title = 'Divvy Dock Station:    ' + this.stationNameSelected;

     placesService.getStationDocksLog(stationName,timeRange).subscribe(() => {
        this.fetchDocks(placesService,timeRange);
     });
   }



   ///////////////////////////////////////////////////////////////////////
   ///////////////////////////////////////////////////////////////////////


   fetchDocks(placesService,timeRange) {
  debugger;
        placesService
          .getDocks()
             .subscribe((data: Dock[]) => {
                   this.docks = data;
                   console.log(this.docks);
                   this.updateChart();
                   this.initSvg();
                   this.initAxis();
                   this.create_d3_chart_legend(timeRange);
                   this.create_d3_chart_X_Y_Axis(timeRange);
                   this.create_d3_line();
                   this.create_d3_sma_line();
                   this.create_d3_sma_line1();
             });
   }



   ///////////////////////////////////////////////////////////////////////
   ///////////////////////////////////////////////////////////////////////


   private initSvg() {
     debugger;
        this.svg = d3.select('#svg')
            .append('g')
            .attr('transform', 'translate(' + this.margin.left + ',' + this.margin.top + ')');
   }

   private initAxis() {
     debugger;
        this.x = d3Scale.scaleTime().range([0, this.width]);
        this.y = d3Scale.scaleLinear().range([this.height, 0]);

        this.x.domain(d3Array.extent(this.docks, (d) => new Date(d.lastCommunicationTime.replace(/-/g,'/').toString() )));
        this.y.domain([0, d3Array.max(this.docks, (d) => d.availableDocks)]);

   }



   ///////////////////////////////////////////////////////////////////////
   ///////////////////////////////////////////////////////////////////////


   private setTimeIncrementFor_X_Axis(timeRange){
     debugger;
      if(timeRange=="1 HOUR"){
           this.svg.append('g')
           .attr('class', 'axis axis--x')
           .attr('transform', 'translate(0,' + this.height + ')')
           .call(d3Axis.axisBottom(this.x)
           .ticks(d3.timeMinute.every(2)))
           .selectAll("text")
           .attr("y", 0)
           .attr("x", 9)
           .attr("dy", ".35em")
           .attr("transform", "rotate(45)")
           .style("text-anchor", "start")
      }
      else if(timeRange=="24 HOUR"){
               this.svg.append('g')
               .attr('class', 'axis axis--x')
               .attr('transform', 'translate(0,' + this.height + ')')
               .call(d3Axis.axisBottom(this.x)
               .ticks(d3.timeHour.every(1)))
               .selectAll("text")
               .attr("y", 0)
               .attr("x", 9)
               .attr("dy", ".35em")
               .attr("transform", "rotate(45)")
               .style("text-anchor", "start")
           }
           else if(timeRange=="7 DAY"){

                         this.svg.append('g')
                         .attr('class', 'axis axis--x')
                         .attr('transform', 'translate(0,' + this.height + ')')
                         .call(d3Axis.axisBottom(this.x)
                         .ticks(d3.timeHour.every(12)))
                         .selectAll("text")
                         .attr("y", 0)
                         .attr("x", 9)
                         .attr("dy", ".35em")
                         .attr("transform", "rotate(45)")
                         .style("text-anchor", "start")

                 }

   }




   ///////////////////////////////////////////////////////////////////////
   ///////////////////////////////////////////////////////////////////////


   private create_d3_chart_X_Y_Axis(timeRange) {
  debugger;
       this.svg.append('g')
            .attr('class', 'axis axis--x')
            .attr('transform', 'translate(0,' + this.height + ')')
            .append('text')
            .attr('class', 'axis-title')
            .attr('text-anchor', 'middle')
            .attr('transform', 'translate(420,50)')
            .text('Time');

       this.setTimeIncrementFor_X_Axis(timeRange);

       this.svg.append('g')
            .attr('class', 'axis axis--y')
            .call(d3Axis.axisLeft(this.y))
            .append('text')
            .attr('class', 'axis-title')
            .attr("transform", "translate("+ 1 +","+(this.height/2)+")rotate(90)")
            .attr('y', 35)
            .attr('dy', '.71em')
            .style('text-anchor', 'end')
            .text('Available Docks');
   }




   ///////////////////////////////////////////////////////////////////////
   ///////////////////////////////////////////////////////////////////////


   private create_d3_line() {
  debugger;
       this.line = d3Shape.line()
            .x( (d: any) => this.x(new Date(d.lastCommunicationTime.replace(/-/g,'/').toString()) ))
            .y( (d: any) => {
              console.log(d);
               return this.y(d.availableDocks);
             });
       this.svg.append('path')
            .datum(this.docks)
            .attr('class', 'line')
            .attr('d', this.line);


   }

   //for 24 hours
   private create_d3_sma_line() {
     const days = {};
     let sum = 0;
     let index = 0;
       this.movingAverageLine1 = d3Shape.line()
            .x( (d: any) => this.x(new Date(d.lastCommunicationTime.replace(/-/g,'/').toString()) ))
            .y( (d: any) => {
              const date = new Date(d.lastCommunicationTime);
              if(days[date.getDay()]) {
                sum = days[date.getDay()].sum;
                index = days[date.getDay()].index;
              } else {
                sum = 0;
                index = 0;
              }
              sum += d.availableDocks;
              index++;
              days[date.getDay()] = {
                sum,
                index,
              };
              return this.y(sum/index) ;
            });
       this.svg.append('path')
            .datum(this.docks)
            .attr('class', 'redline')
            .attr('d', this.movingAverageLine1);
   }
   

   // For 1 hour moving average
   private create_d3_sma_line1() {
    const days = {};
       this.movingAverageLine = d3Shape.line()
            .x( (d: any, index: number) => this.x(new Date(d.lastCommunicationTime.replace(/-/g,'/').toString()) ))
            .y( (d: any, index: number) => {
              const date = new Date(d.lastCommunicationTime);
              if (!days[date.getDay()]) {
                days[date.getDay()] = {
                  sumArray: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
                  countArray: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
                }
              }
              const sumArray = days[date.getDay()].sumArray;
              const countArray = days[date.getDay()].countArray;

              const sum = sumArray[date.getHours()] + d.availableDocks 
              const count = countArray[date.getHours()] + 1;
              const avg = sum / count;

              sumArray[date.getHours()] = sum;
              countArray[date.getHours()] = count;

              days[date.getDay()] = {
                sumArray,
                countArray
              }
              return this.y(avg);
            });
       this.svg.append('path')
            .datum(this.docks)
            .attr('class', 'purpleline')
            .attr('d', this.movingAverageLine);

   }


   ///////////////////////////////////////////////////////////////////////
   ///////////////////////////////////////////////////////////////////////


   private create_d3_chart_legend(timeRange) {
  debugger;
     var legend = this.svg.append('g')
                             .attr("class", "legend")
                             .attr("x", 15)
                             .attr("y", 5)
                             .attr('transform','translate(860,5)')
                             .attr("width", 18)
                             .attr("height", 10)

                  legend.append("rect")
                             .attr("class", "legend")
                             .attr("x", 1)
                             .attr("y", 5)
                             .attr("width", 15)
                             .attr("height", 7)
                             .style("fill", 'green');
      
                   legend.append("text")
                             .attr("class", "legendTxt")
                             .style("font-size", "13px")
                             .attr("x", 20)
                             .attr("y", 5)
                             .attr("dy", "10px")
                             .style("text-anchor", "start")
                             .text("Real-Time Data" );

        var legend2 = this.svg.append('g')
                             .attr("class", "legend")
                             .attr("x", 15)
                             .attr("y", 50)
                             .attr('transform','translate(860,5)')
                             .attr("width", 18)
                             .attr("height", 10)

                  legend2.append("rect")
                             .attr("class", "legend")
                             .attr("x", 1)
                             .attr("y", 50)
                             .attr("width", 15)
                             .attr("height", 7)
                             .style("fill", 'red');
      
                   legend2.append("text")
                             .attr("class", "legendTxt")
                             .style("font-size", "13px")
                             .attr("x", 20)
                             .attr("y", 50)
                             .attr("dy", "10px")
                             .style("text-anchor", "start")
                             .text("SMA for 24 Hours" );

                  ///////////////////////////

                  var legend3 = this.svg.append('g')
                  .attr("class", "legend")
                  .attr("x", 15)
                  .attr("y", 50)
                  .attr('transform','translate(860,5)')
                  .attr("width", 18)
                  .attr("height", 10)

                  legend3.append("rect")
                  .attr("class", "legend")
                  .attr("x", 1)
                  .attr("y", 90)
                  .attr("width", 15)
                  .attr("height", 7)
                  .style("fill", 'blue');

               legend3.append("text")
                  .attr("class", "legendTxt")
                  .style("font-size", "13px")
                  .attr("x", 20)
                  .attr("y", 90)
                  .attr("dy", "10px")
                  .style("text-anchor", "start")
                  .text("SMA for 1 Hour" );
   }




   ///////////////////////////////////////////////////////////////////////
   ///////////////////////////////////////////////////////////////////////


   private updateChart(){
  debugger;
      var chart = d3.select('#svg').select("g").remove().exit();


   }



   ///////////////////////////////////////////////////////////////////////
   ///////////////////////////////////////////////////////////////////////



   ngOnDestroy() {
  debugger;
     if (this.LineChart !== undefined) {
             this.LineChart.unsubscribe();
     }

   }




}
