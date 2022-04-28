import './FlockingGui.css';
import { Button, Slider, Grid, Container } from '@mui/material';
import PlayIcon from '@mui/icons-material/PlayArrow';
import PauseIcon from '@mui/icons-material/Pause';
import RefreshIcon from '@mui/icons-material/Refresh';
import React from 'react';
import FlockingSim from './FlockingSim.tsx';
import { vec3 } from './FlockingSim.tsx';

import * as d3 from "d3";
import { _3d } from 'd3-3d';

const aspectRatio = 1.0 / 2.0;
const width = 1050;
const height = width * aspectRatio;
const margin = 20;
const depth = 600;
const radRange = [5, 10]

const timestep = 1;

const defaultNumBirds = 100;
const defaultSeparation = 50;
const defaultAlignment = 50;
const defaultCohesion = 50;
const defaultMomentum = 50;
const defaultVisualRange = width / 6;

class FlockingGui extends React.Component {
  state = {
    resetPoints: false,
    createView: false,
    running: false,
    numBirds: defaultNumBirds,
    separation: defaultSeparation,
    alignment: defaultAlignment,
    cohesion: defaultCohesion,
    momentum: defaultMomentum,
    visualRange: defaultVisualRange,
    flock: new FlockingSim(50, width, height, depth)
  }

  depthRadiusMap = d3.scaleLinear()
    .domain([0, depth])
    .range(radRange.reverse())

  makeView() {
    var svg = d3.select("#holder")
      .append("svg")
      .attr("id", "svg-sim")
      .attr("width", width + (2 * margin))
      .attr("height", height + (2 * margin));
    
    svg.append("rect")
      .attr("id", "screen")
      .attr("x", 0)
      .attr("y", 0)
      .attr("width", width + (2 * margin))
      .attr("height", height + 2 * margin)
      .style("fill", "lightblue")

    svg.append("g")
      .attr("transform", `translate(${margin}, ${margin})`)

    this.setupPoints();
  }

  async updatePoints() {
    // get data
    var data = this.state.flock.getNextStep(
      this.state.separation,
      this.state.alignment,
      this.state.cohesion,
      this.state.momentum,
      this.state.visualRange,
    );

    var svg = d3.select("#holder")
      .select("svg")
      .select("g");

    svg.selectAll("g")
      .data(data)
      .each((d: number[], i: number) => {
        var group = svg.select(`#bird_${i}`)
        
        group.select("#pt")
          .data([d]);

        group.select("#range")
          .data([d]);
        
        group.select("line")
          .data([d]);
      });

    svg.selectAll("line")
      .transition()
      .duration(timestep)
      .ease(d3.easeLinear)
      .attr("x1", (d: vec3[]) => d[0].x)
      .attr("y1", (d: vec3[]) => d[0].y)
      .attr("x2", (d: vec3[]) => d[0].add(d[1].normalize().scaleUp(2 * this.depthRadiusMap(d[0].z))).x)
      .attr("y2", (d: vec3[]) => d[0].add(d[1].normalize().scaleUp(2 * this.depthRadiusMap(d[0].z))).y)

    svg.selectAll("#range")
      .transition()
      .duration(timestep)
      .ease(d3.easeLinear)
      .attr("cx", (d: vec3[]) => d[0].x)
      .attr("cy", (d: vec3[]) => d[0].y)

    await svg.selectAll("#pt")
      .transition()
      .duration(timestep)
      .ease(d3.easeLinear)
      .attr("cx", (d: vec3[]) => d[0].x)
      .attr("cy", (d: vec3[]) => d[0].y)
      .attr("r", (d: vec3[]) => this.depthRadiusMap(d[0].z))
      .end();
    
    // await new Promise(resolve => setTimeout(resolve, 1000));

    if (this.state.running) {
      this.updatePoints();
    }
  }
  
  setupPoints() {
    // get data
    var data = this.state.flock.getCur();

    var svg = d3.select("#holder")
      .select("svg")
      .select("g");

    // remove all previous circles
    svg.selectAll("g")
      .remove();

    var birds = svg.selectAll("g")
      .data(data)
      .enter()
      .append("g")
      .attr("id", (d: vec3[], i: number) => `bird_${i}`)
      .each((d: vec3[], i: number) => {
        var group = svg.select(`#bird_${i}`)
        
        group.append("circle")
          .attr("id", "pt")
          .data([d])
          .attr("cx", d[0].x)
          .attr("cy", d[0].y)
          .attr("r", this.depthRadiusMap(d[0].z))
          .style("fill", i === 0 ? "red" : "black");

        if (i === 0) {
          group.append("circle")
            .attr("id", "range")
            .data([d])
            .attr("cx", d[0].x)
            .attr("cy", d[0].y)
            .attr("r", this.state.visualRange)
            .style("fill", i === 0 ? "red" : "black")
            .style("opacity", .1);
        }

        group.append("line")
          .data([d])
          .attr("x1", d[0].x)
          .attr("y1", d[0].y)
          .attr("x2", d[0].add(d[1].normalize().scaleUp(2 * this.depthRadiusMap(d[0].z))).x)
          .attr("y2", d[0].add(d[1].normalize().scaleUp(2 * this.depthRadiusMap(d[0].z))).y)
          .style("stroke-width", 2)
          .style("stroke", i === 0 ? "red" : "black")
      });
  }

  componentDidMount() {
    this.setState({
      createView: true
    })
  }

  componentDidUpdate(prevProps, prevState) {
    if (this.state.createView !== prevState.createView) {
      this.makeView();
    }

    if (this.state.numBirds !== prevState.numBirds || 
      this.state.resetPoints && !prevState.resetPoints) {
      this.setupPoints()
      this.setState({resetPoints: false});
    } else {
      if (this.state.running && !prevState.running) {
        this.updatePoints();
      }
    }
  }

  handleNumBirdsChange = (event: Event, newValue: number | number[]) => {
    this.setState({
      running: false,
      numBirds: newValue,
      flock: new FlockingSim(newValue, width, height, depth)
    });
  };

  handleSeparationChange = (event: Event, newValue: number | number[]) => {
    this.setState({
      separation: newValue
    });
  };

  handleAlignmentChange = (event: Event, newValue: number | number[]) => {
    this.setState({
      alignment: newValue
    });
  };

  handleCohesionChange = (event: Event, newValue: number | number[]) => {
    this.setState({
      cohesion: newValue
    });
  };

  handleMomentumChange = (event: Event, newValue: number | number[]) => {
    this.setState({
      momentum: newValue
    });
  };

  handleVisualRangeChange = (event: Event, newValue: number | number[]) => {
    this.setState({
      visualRange: newValue
    });

    var svg = d3.select("#holder")
      .select("svg")
      .select("g");

    svg.selectAll("#range")
      .attr("r", this.state.visualRange)
  };

  handlePPClick = () => {
    this.setState({
      running: !this.state.running
    });
  };

  handleRefresh = () => {
    this.setState({
      running: false,
      resetPoints: true,
      numBirds: defaultNumBirds,
      separation: defaultSeparation,
      alignment: defaultAlignment,
      cohesion: defaultCohesion,
      momentum: defaultMomentum,
      visualRange: defaultVisualRange,
      flock: new FlockingSim(50, width, height, depth)
    });
  };

  render() {
    return (
      <Container maxWidth="lg">
        <Grid container columnSpacing={4} className="params" columns={18}>
          <Grid item xs={3}>
            <p>Number of Birds</p>
          </Grid> 
          <Grid item xs={3}>
            <p>Separation</p>
          </Grid> 
          <Grid item xs={3}>
            <p>Alignment</p>
          </Grid> 
          <Grid item xs={3}>
            <p>Cohesion</p>
          </Grid> 
          <Grid item xs={3}>
            <p>Momentum</p>
          </Grid> 
          <Grid item xs={3}>
            <p>Visual Range</p>
          </Grid> 
          <Grid item xs={3}>
            <Slider 
              size="small"
              min={5}
              max={200}
              value={this.state.numBirds}
              onChange={this.handleNumBirdsChange}>
            </Slider>
          </Grid> 
          <Grid item xs={3}>
            <Slider 
              size="small"
              value={this.state.separation}
              onChange={this.handleSeparationChange}>
            </Slider>
          </Grid> 
          <Grid item xs={3}>
            <Slider 
              size="small"
              value={this.state.alignment}
              onChange={this.handleAlignmentChange}>
            </Slider>
          </Grid> 
          <Grid item xs={3}>
            <Slider 
              size="small"
              value={this.state.cohesion}
              onChange={this.handleCohesionChange}>
            </Slider>
          </Grid>
          <Grid item xs={3}>
            <Slider 
              size="small"
              min={0}
              max={100}
              value={this.state.momentum}
              onChange={this.handleMomentumChange}>
            </Slider>
          </Grid>
          <Grid item xs={3}>
            <Slider 
              size="small"
              min={0}
              max={width / 3}
              value={this.state.visualRange}
              onChange={this.handleVisualRangeChange}>
            </Slider>
          </Grid>
        </Grid>

        <Grid container columnSpacing={2} columns={14} className="buttons">
          <Grid item xs={5}/>
          <Grid item xs={2}>
            <Button 
              color={this.state.running ? "error" : "primary"}
              variant="contained"
              onClick={this.handlePPClick}
              startIcon={this.state.running ? <PauseIcon/> : <PlayIcon/>}
              className="play-pause">
              {this.state.running ? "Pause" : "Play"}
            </Button>
          </Grid>
          <Grid item xs={2}>
            <Button 
              color="secondary"
              variant="outlined"
              onClick={this.handleRefresh}
              startIcon={<RefreshIcon/>}>
              Refresh
            </Button>
          </Grid>
          <Grid item xs={5}/>
        </Grid>
        

        <div id="holder"/>
      </Container>
    );
  }
}

export default FlockingGui;


