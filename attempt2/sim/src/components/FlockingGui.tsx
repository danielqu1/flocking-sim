import './FlockingGui.css';
import { Button, Slider, Grid, Container } from '@mui/material';
import PlayIcon from '@mui/icons-material/PlayArrow';
import PauseIcon from '@mui/icons-material/Pause';
import React from 'react';
import FlockingSim from './FlockingSim.tsx';

import * as d3 from "d3";
import { _3d } from 'd3-3d';

const aspectRatio = 3.0 / 4.0; // 2:3 aspect ratio
const width = 1000;
const height = width * aspectRatio;
const margin = {
    top: 20,
    bottom: 80,
    left: 80,
    right: 20,
};

const startAngle = Math.PI/4;


class FlockingGui extends React.Component {
  state = {
    createView: false,
    running: false,
    numBirds: 50,
    separation: 50,
    alignment: 50,
    cohesion: 50,
    flock: new FlockingSim(50)
  }

  makeView() {
    var origin = [480, 300], j = 10, scale = 20, scatter = [], yLine = [], xGrid = [], beta = 0, alpha = 0, key = function(d){ return d.id; };

    var svg = d3.select("#holder")
      .append("svg")
      .attr("width", width)
      .attr("height", height);
      // .attr("preserveAspectRatio", "xMinYMin meet")
      // .attr("viewBox", `0 0 ${width + margin.left + margin.right} ${height + margin.top + margin.bottom}`);

    // var mx, my, mouseX, mouseY;

    // var grid3d = d3._3d()
    //     .shape('GRID', 20)
    //     .origin(origin)
    //     .rotateY( startAngle)
    //     .rotateX(-startAngle)
    //     .scale(scale);

    // var point3d = d3._3d()
    //     .x(function(d){ return d.x; })
    //     .y(function(d){ return d.y; })
    //     .z(function(d){ return d.z; })
    //     .origin(origin)
    //     .rotateY( startAngle)
    //     .rotateX(-startAngle)
    //     .scale(scale);

    // var yScale3d = d3._3d()
    //     .shape('LINE_STRIP')
    //     .origin(origin)
    //     .rotateY( startAngle)
    //     .rotateX(-startAngle)
    //     .scale(scale);

  }
  
  componentDidMount() {
    this.setState({
      createView: true
    })
  }

  componentDidUpdate(prevProps, prevState) {
    // console.log(this.state)
    this.state.flock.getNextStep();

    if (this.state.createView != prevState.createView) {
      this.makeView();
    }

    // if numBirds changed, delete and replace all birds in simulation
  }

  handleNumBirdsChange = (event: Event, newValue: number | number[]) => {
    this.setState({
      running: false,
      numBirds: newValue,
      flock: new FlockingSim(newValue)
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

        <Button 
          color={this.state.running ? "error" : "primary"}
          variant="contained"
          onClick={this.handlePPClick}
          startIcon={this.state.running ? <PauseIcon/> : <PlayIcon/>}
          className="play-pause">
          {this.state.running ? "Pause" : "Play"}
        </Button>

        <div id="holder"/>
      </Container>
    );
  }
}

export default FlockingGui;


