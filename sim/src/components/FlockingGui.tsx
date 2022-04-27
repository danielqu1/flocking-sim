import './FlockingGui.css';
import { Button, Slider, Grid, Container } from '@mui/material';
import PlayIcon from '@mui/icons-material/PlayArrow';
import PauseIcon from '@mui/icons-material/Pause';
import RefreshIcon from '@mui/icons-material/Refresh';
import React from 'react';

import FlockingSim from './FlockingSim.tsx';

import * as d3 from "d3";
import { _3d } from 'd3-3d';

const aspectRatio = 3.0 / 4.0; // 2:3 aspect ratio
const width = 800;
const height = width * aspectRatio;
const margin = {
    top: 20,
    bottom: 80,
    left: 80,
    right: 20,
};

const timestep = 15;

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

  origin = [480, 300];
  j = 10;
  scale = 20;
  scatter = [];
  yLine = [];
  xGrid = [];
  beta = 0;
  alpha = 0;
  mx;
  my;
  mouseX;
  mouseY;
  // color  = d3.scaleOrdinal(d3.schemeCategory20);
  
  key = function(d){ return d.id; };

  grid3d = _3d()
    .shape('GRID', 20)
    .origin(origin)
    .rotateY( startAngle)
    .rotateX(-startAngle)
    .scale(this.scale);

  point3d = _3d()
    .x(function(d){ return d.x; })
    .y(function(d){ return d.y; })
    .z(function(d){ return d.z; })
    .origin(origin)
    .rotateY( startAngle)
    .rotateX(-startAngle)
    .scale(this.scale);

  makeView() {
    var svg = d3.select("#holder")
      .append("svg")
      .attr("width", width)
      .attr("height", height);
      // .attr("preserveAspectRatio", "xMinYMin meet")
      // .attr("viewBox", `0 0 ${width + margin.left + margin.right} ${height + margin.top + margin.bottom}`);


    

      svg.call(d3.drag()
          .on('drag', this.dragged)
          .on('start', this.dragStart)
          .on('end', this.dragEnd))
        .append('g');

    // var mx, my, mouseX, mouseY;
    this.viewInit()
    
  }

  dragStart(event){
    this.mx = event.x;
    this.my = event.y;
  }

  dragged(event){
    this.mouseX = this.mouseX || 0;
    this.mouseY = this.mouseY || 0;
    this.beta   = (event.x - this.mx + this.mouseX) * Math.PI / 230 ;
    this.alpha  = (event.y - this.my + this.mouseY) * Math.PI / 230  * (-1);
    var data = [
      this.grid3d.rotateY(this.beta + startAngle).rotateX(this.alpha - startAngle)(this.xGrid),
      this.point3d.rotateY(this.beta + startAngle).rotateX(this.alpha - startAngle)(this.scatter),
    ];
    this.updatePoints(data, 0);
  }

  dragEnd(event){
      this.mouseX = event.x - this.mx + this.mouseX;
      this.mouseY = event.y - this.my + this.mouseY;
  }

  async updatePoints(data, tt) {
    var svg = d3.select("#holder").select("svg").select("g");

    function posPointX(d){
      // console.log(Number(d.projected.x.substring(1)))
      return Number(d.projected.x.substring(1));
    }

    function posPointY(d){
        return Number(d.projected.y.substring(1));
    }

    /* ----------- GRID ----------- */

    var xGrid = svg.selectAll('path.grid').data(data[0], this.key);

    xGrid
        .enter()
        .append('path')
        .attr('class', '_3d grid')
        .merge(xGrid)
        .attr('stroke', 'black')
        .attr('stroke-width', 0.3)
        .attr('fill', function(d){ return d.ccw ? 'lightgrey' : '#717171'; })
        .attr('fill-opacity', 0.9)
        .attr('d', this.grid3d.draw);

    xGrid.exit().remove();

    /* ----------- POINTS ----------- */

    var points = svg.selectAll('circle').data(data[1], this.key);

    await points
        .enter()
        .append('circle')
        .attr('class', '_3d')
        .attr('opacity', 0)
        .attr('cx', posPointX)
        .attr('cy', posPointY)
        .merge(points)
        .transition().duration(tt)
        .attr('r', 3)
        .attr('stroke', 'black')
        .attr('fill', 'blue')
        .attr('opacity', 1)
        .attr('cx', posPointX)
        .attr('cy', posPointY)
        .end()

    points.exit().remove();

    if (this.state.running){
      this.viewInit();
    }
  }

  viewInit() {
    var cnt = 0;
    this.xGrid = [];
    this.scatter = [];
    for(var z = -this.j; z < this.j; z++){
      for(var x = -this.j; x < this.j; x++){
        this.xGrid.push([x, 1, z]);
        this.scatter.push({x: x, y: d3.randomUniform(0, -10)(), z: z, id: 'point_' + cnt++});
      }
    }


    var data = [
        this.grid3d(this.xGrid),
        this.point3d(this.scatter),
    ];
    this.updatePoints(data, timestep);
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

    if (this.state.running && !prevState.running) {
      this.viewInit();
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

  handleReset = () => {
    this.setState({
      numBirds: 50,
      separation: 50,
      alignment: 50,
      cohesion: 50,
      flock: new FlockingSim(50)
    })
  }

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


        <Grid container columnSpacing={2} className="flock-buttons">
          <Grid item xs={6}>
            <Button 
              color={this.state.running ? "error" : "primary"}
              variant="contained"
              onClick={this.handlePPClick}
              startIcon={this.state.running ? <PauseIcon/> : <PlayIcon/>}>
              {this.state.running ? "Pause" : "Play"}
            </Button>
          </Grid>
          <Grid item xs={6}>
            <Button
              color="secondary"
              variant="outlined"
              onClick={this.handleReset}
              startIcon={<RefreshIcon/>}>
              Reset
            </Button>
          </Grid>

        </Grid>
        

        

        <div id="holder"/>
      </Container>
    );
  }
}

export default FlockingGui;


