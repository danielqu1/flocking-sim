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
const depth = 300;

const timestep = 50;

class FlockingGui extends React.Component {
  state = {
    createView: false,
    running: false,
    numBirds: 50,
    separation: 10,
    alignment: 1,
    cohesion: 3,
    flock: new FlockingSim(50, width, height, depth)
  }

  depthRadiusMap = d3.scaleLinear()
    .domain([0, depth])
    .range([1, 10])

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
    var data = this.state.flock.getNextStep();

    var svg = d3.select("#holder")
      .select("svg")
      .select("g");

    svg.selectAll("g")
      .data(data)
      .each((d: number[], i: number) => {
        var group = svg.select(`#bird_${i}`)
        
        group.select("circle")
          .data([d]);
      });

    await svg.selectAll("circle")
      .transition()
      .duration(timestep)
      .ease(d3.easeLinear)
      .attr("cx", (d: vec3[]) => d[0].x)
      .attr("cy", (d: vec3[]) => d[0].y)
      .attr("r", (d: vec3[]) => this.depthRadiusMap(d[0].z))
      .end();
    
    if (this.state.running) {
      this.updatePoints();
    }
  }
  
  setupPoints() {
    // get data
    var data = this.state.flock.getNextStep();

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
          .data([d])
          .attr("cx", d[0].x)
          .attr("cy", d[0].y)
          .attr("r", this.depthRadiusMap(d[0].z))
          .style("fill", "black");
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

    if (this.state.numBirds !== prevState.numBirds) {
      this.setupPoints()
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

  handlePPClick = () => {
    this.setState({
      running: !this.state.running
    });
  };

  handleRefresh = () => {
    this.setState({
      running: false,
      numBirds: 50,
      separation: 10,
      alignment: 1,
      cohesion: 3,
      flock: new FlockingSim(50, width, height, depth)
    });
  };

  render() {
    return (
      <Container maxWidth="lg">
        <Grid container columnSpacing={8} className="params">
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
            <Slider 
              size="small"
              min={5}
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


