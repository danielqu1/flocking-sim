import './FlockingGui.css';
import { Button, Slider, Grid, Container, Select, MenuItem} from '@mui/material';
import PlayIcon from '@mui/icons-material/PlayArrow';
import PauseIcon from '@mui/icons-material/Pause';
import RefreshIcon from '@mui/icons-material/Refresh';
import React from 'react';
import { vec3, FlockingSim } from './FlockingSim.tsx';

import * as d3 from "d3";
import { _3d } from 'd3-3d';

const aspectRatio = 1.0 / 2.5;
const width = 1000;
const height = width * aspectRatio;
const margin = 70;
const depth = 600;
const radRange = [5, 10]

// const timestep = 1;
const timestep = 1;

const defaultNumBirds = 100;
// const defaultSeparation = 50;
// const defaultAlignment = 50;
// const defaultCohesion = 50;
// const defaultMomentum = 50;
// const defaultLightAttraction = 50;
// const defaultVisualRange = width / 6;
const defaultSeparation = 5;
const defaultAlignment = 5;
const defaultCohesion = 5;
const defaultMomentum = 5;
const defaultLightAttraction = 5;
const defaultVisualRange = width / 12;
const defaultNumPredators = 0;
const defaultPredVisualRange = width / 12;
const defaultFear = 5;
const defaultPredSpeed = 200;

// const defaultNumObstacles = 0;

class FlockingGui extends React.Component {
  state = {
    resetPoints: false,
    createView: false,
    running: false,
    numBirds: defaultNumBirds,
    numPredators: defaultNumPredators,
    separation: defaultSeparation,
    alignment: defaultAlignment,
    cohesion: defaultCohesion,
    momentum: defaultMomentum,
    lightAttraction: defaultLightAttraction,
    visualRange: defaultVisualRange,
    predVisualRange: defaultPredVisualRange,
    fear: defaultFear,
    predatorSpeed: defaultPredSpeed,
    // numObstacles: defaultNumObstacles,
    flock: new FlockingSim(defaultNumBirds, defaultNumPredators, width, height, depth)
  }

  lightLoc = [0, 0];
  useLight = false;

  depthRadiusMap = d3.scaleLinear()
    .domain([0, depth])
    .range(radRange.reverse())

  makeView() {
    var svg = d3.select("#holder")
      .append("svg")
      .attr("id", "svg-sim")
      .attr("width", width + (2 * margin))
      .attr("height", height + (2 * margin));

    var radialGradient = svg.append("defs")
      .append("radialGradient")
      .attr("id", "lightGradient")
    radialGradient.append("stop")
      .attr("offset", "0%")
      .attr("stop-color", "white")
      .attr("stop-opacity", 1)
    radialGradient.append("stop")
      .attr("offset", "20%")
      .attr("stop-color", "gold")
      .attr("stop-opacity", .8)
    radialGradient.append("stop")
      .attr("offset", "100%")
      .attr("stop-color", "gold")
      .attr("stop-opacity", 0)

    svg.append("rect")
      .attr("id", "screen")
      .attr("x", 0)
      .attr("y", 0)
      .attr("width", width + (2 * margin))
      .attr("height", height + 2 * margin)
      .style("fill", "lightblue")

    svg.append("circle")
      .attr("id", "mouseLight")
      .attr("cx", width / 2)
      .attr("cy", height / 2)
      .attr("r", 0)
      .style("fill", "url('#lightGradient')")

    svg.append("g")
      .attr("transform", `translate(${margin}, ${margin})`)
      
    svg.append("rect")
      .attr("x", margin)
      .attr("y", margin)
      .attr("width", width)
      .attr("height", height)
      .style("opacity", 0)
      .on("mousemove", (event) => {
        let ptr = d3.pointer(event)
        d3.select("#mouseLight")
          .transition()
          .ease(d3.easeLinear)
          .duration(80)
          .attr("cx", ptr[0])
          .attr("cy", ptr[1])
        this.lightLoc = [ptr[0] - margin, ptr[1] - margin]
      })
      .on("mouseenter", () => {
        d3.select("#mouseLight")
          .attr("r", 50)
        this.useLight = true;
      })
      .on("mouseleave", () => {
        d3.select("#mouseLight")
          .attr("r", 0)
        this.useLight = false;
      })

    this.setupPoints();
  }

  async updatePoints() {
    // get data
    var data = this.state.flock.getNextStep(
      this.state.separation,
      this.state.alignment,
      this.state.cohesion,
      this.state.momentum,
      this.state.lightAttraction,
      this.state.fear,
      this.state.visualRange,
      this.state.predVisualRange,
      this.state.predatorSpeed,
      new vec3(this.lightLoc[0], this.lightLoc[1], depth / 2),
      this.useLight
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

        group.select("#birdRange")
          .data([d]);
        group.select("#predRange")
          .data([d]);
        
        group.select("#leftDir")
          .data([d]);
        group.select("#rightDir")
          .data([d]);
        group.select("#centerDir")
          .data([d]);
      });

    svg.selectAll("#centerDir")
      .transition()
      .duration(timestep)
      .ease(d3.easeLinear)
      .attr("x1", (d: vec3[]) => d[0].x)
      .attr("y1", (d: vec3[]) => d[0].y)
      .attr("x2", (d: vec3[]) => d[0].add(d[1].normalize().scaleUp(2 * this.depthRadiusMap(d[0].z))).x)
      .attr("y2", (d: vec3[]) => d[0].add(d[1].normalize().scaleUp(2 * this.depthRadiusMap(d[0].z))).y)
      .style("opacity", d => d[3] ? 0 : 1)

    svg.selectAll("#leftDir")
      .transition()
      .duration(timestep)
      .ease(d3.easeLinear)
      .attr("x1", (d: vec3[]) => d[0].x + d[1].normalize().scaleUp(this.depthRadiusMap(d[0].z) - .2).y)
      .attr("y1", (d: vec3[]) => d[0].y - d[1].normalize().scaleUp(this.depthRadiusMap(d[0].z) - .2).x)
      .attr("x2", (d: vec3[]) => d[0].add(d[1].normalize().scaleUp(2 * this.depthRadiusMap(d[0].z))).x)
      .attr("y2", (d: vec3[]) => d[0].add(d[1].normalize().scaleUp(2 * this.depthRadiusMap(d[0].z))).y)
      .style("opacity", d => d[3] ? 0 : 1)

    svg.selectAll("#rightDir")
      .transition()
      .duration(timestep)
      .ease(d3.easeLinear)
      .attr("x1", (d: vec3[]) => d[0].x - d[1].normalize().scaleUp(this.depthRadiusMap(d[0].z) - .2).y)
      .attr("y1", (d: vec3[]) => d[0].y + d[1].normalize().scaleUp(this.depthRadiusMap(d[0].z) - .2).x)
      .attr("x2", (d: vec3[]) => d[0].add(d[1].normalize().scaleUp(2 * this.depthRadiusMap(d[0].z))).x)
      .attr("y2", (d: vec3[]) => d[0].add(d[1].normalize().scaleUp(2 * this.depthRadiusMap(d[0].z))).y)
      .style("opacity", d => d[3] ? 0 : 1)

    svg.selectAll("#birdRange")
      .transition()
      .duration(timestep)
      .ease(d3.easeLinear)
      .attr("cx", (d: vec3[]) => d[0].x)
      .attr("cy", (d: vec3[]) => d[0].y)
      .style("opacity", d => d[3] ? .05 : .1)
      
    svg.selectAll("#predRange")
      .transition()
      .duration(timestep)
      .ease(d3.easeLinear)
      .attr("cx", (d: vec3[]) => d[0].x)
      .attr("cy", (d: vec3[]) => d[0].y)
      .style("opacity", d => d[3] ? .05 : .1)

    await svg.selectAll("#pt")
      .transition()
      .duration(timestep)
      .ease(d3.easeLinear)
      .attr("cx", (d: vec3[]) => d[0].x)
      .attr("cy", (d: vec3[]) => d[0].y)
      .attr("r", (d: vec3[]) => this.depthRadiusMap(d[0].z))
      .style("opacity", d => d[3] ? .1 : 1)
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

    svg.selectAll("g")
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
          .style("fill", d[2] ? "red" : "black");

        if (i === 0) {
          group.append("circle")
            .attr("id", "birdRange")
            .data([d])
            .attr("cx", d[0].x)
            .attr("cy", d[0].y)
            .attr("r", this.state.visualRange)
            .style("fill", d[2] ? "red" : "black")
            .style("opacity", .1);
        } else if (i === this.state.numBirds) {
          group.append("circle")
            .attr("id", "predRange")
            .data([d])
            .attr("cx", d[0].x)
            .attr("cy", d[0].y)
            .attr("r", this.state.predVisualRange)
            .style("fill", d[2] ? "red" : "black")
            .style("opacity", .1);
        }

        
        group.append("line")
          .attr("id", "leftDir")
          .data([d])
          .attr("x1", d[0].x + d[1].normalize().scaleUp(this.depthRadiusMap(d[0].z) - .2).y)
          .attr("y1", d[0].y - d[1].normalize().scaleUp(this.depthRadiusMap(d[0].z) - .2).x)
          .attr("x2", d[0].add(d[1].normalize().scaleUp(2 * this.depthRadiusMap(d[0].z))).x)
          .attr("y2", d[0].add(d[1].normalize().scaleUp(2 * this.depthRadiusMap(d[0].z))).y)
          .style("stroke-width", 2)
          .style("stroke", d[2] ? "red" : "black")

        group.append("line")
          .attr("id", "rightDir")
          .data([d])
          .attr("x1", d[0].x - d[1].normalize().scaleUp(this.depthRadiusMap(d[0].z) - .2).y)
          .attr("y1", d[0].y + d[1].normalize().scaleUp(this.depthRadiusMap(d[0].z) - .2).x)
          .attr("x2", d[0].add(d[1].normalize().scaleUp(2 * this.depthRadiusMap(d[0].z))).x)
          .attr("y2", d[0].add(d[1].normalize().scaleUp(2 * this.depthRadiusMap(d[0].z))).y)
          .style("stroke-width", 2)
          .style("stroke", d[2] ? "red" : "black")

        group.append("line")
          .attr("id", "centerDir")
          .data([d])
          .attr("x1", d[0].x)
          .attr("y1", d[0].y)
          .attr("x2", d[0].add(d[1].normalize().scaleUp(2 * this.depthRadiusMap(d[0].z))).x)
          .attr("y2", d[0].add(d[1].normalize().scaleUp(2 * this.depthRadiusMap(d[0].z))).y)
          .style("stroke-width", 2)
          .style("stroke", d[2] ? "red" : "black")
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
      this.state.numPredators !== prevState.numPredators || 
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
      flock: new FlockingSim(newValue, this.state.numPredators, width, height, depth)
    });
  };

  handleNumPredatorsChange = (event: Event, newValue: number | number[]) => {
    this.setState({
      running: false,
      numPredators: newValue,
      flock: new FlockingSim(this.state.numBirds, newValue, width, height, depth)
    });
  };

  handlePredSpeedChange = (event: Event, newValue: number | number[]) => {
    this.setState({
      predatorSpeed: newValue
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

  handleLightAttractionChange = (event: Event, newValue: number | number[]) => {
    this.setState({
      lightAttraction: newValue
    });
  };

  handleFearChange = (event: Event, newValue: number | number[]) => {
    this.setState({
      fear: newValue
    });
  };

  handleVisualRangeChange = (event: Event, newValue: number | number[]) => {
    this.setState({
      visualRange: newValue
    });

    var svg = d3.select("#holder")
      .select("svg")
      .select("g");

    svg.selectAll("#birdRange")
      .attr("r", this.state.visualRange)
  };

  handlePredVisualRangeChange = (event: Event, newValue: number | number[]) => {
    this.setState({
      predVisualRange: newValue
    });

    var svg = d3.select("#holder")
      .select("svg")
      .select("g");

    svg.selectAll("#predRange")
      .attr("r", this.state.predVisualRange)
  };

  // handlePredatorChange = (event) => {
  //   this.setState({
  //     numPredators: event.target.value
  //   });
  // }

  // handleObstacleChange = (event) => {
  //   this.setState({
  //     numObstacles: event.target.value
  //   });
  // }

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
      numPredators: defaultNumPredators,
      separation: defaultSeparation,
      alignment: defaultAlignment,
      cohesion: defaultCohesion,
      momentum: defaultMomentum,
      visualRange: defaultVisualRange,
      predVisualRange: defaultPredVisualRange,
      fear: defaultFear,
      predatorSpeed: defaultPredSpeed,
      flock: new FlockingSim(defaultNumBirds, defaultNumPredators, width, height, depth)
    });
  };

  handleAgain = () => {
    this.setState({
      running: false,
      resetPoints: true,
      flock: new FlockingSim(this.state.numBirds, this.state.numPredators, width, height, depth)
    });
  };

  render() {
    return (
      <Container maxWidth="lg">
        <Grid container columnSpacing={2} className="params" columns={24}>
          <Grid item xs={2}/>
          <Grid item xs={4}>
            <p>Number of Birds</p>
          </Grid>
          <Grid item xs={4}>
            <p>Bird Visual Range</p>
          </Grid> 
          <Grid item xs={4}>
            <p>Number of Predators</p>
          </Grid>
          <Grid item xs={4}>
            <p>Predator Visual Range</p>
          </Grid>
          <Grid item xs={4}>
            <p>Predator Speed</p>
          </Grid>
          <Grid item xs={2}/>

          <Grid item xs={2}/>
          <Grid item xs={4}>
            <Slider 
              size="small"
              min={5}
              max={150}
              value={this.state.numBirds}
              onChange={this.handleNumBirdsChange}>
            </Slider>
          </Grid> 
          <Grid item xs={4}>
            <Slider 
              size="small"
              min={0}
              max={width / 3}
              value={this.state.visualRange}
              onChange={this.handleVisualRangeChange}>
            </Slider>
          </Grid>
          <Grid item xs={4}>
            <Slider 
              size="small"
              min={0}
              max={20}
              value={this.state.numPredators}
              onChange={this.handleNumPredatorsChange}>
            </Slider>
          </Grid> 
          <Grid item xs={4}>
            <Slider 
              size="small"
              min={0}
              max={width / 3}
              value={this.state.predVisualRange}
              onChange={this.handlePredVisualRangeChange}>
            </Slider>
          </Grid>
          <Grid item xs={4}>
            <Slider 
              size="small"
              min={50}
              max={500}
              value={this.state.predatorSpeed}
              onChange={this.handlePredSpeedChange}>
            </Slider>
          </Grid>
          <Grid item xs={2}/>


          <Grid item xs={4}>
            <p>Separation</p>
          </Grid> 
          <Grid item xs={4}>
            <p>Alignment</p>
          </Grid> 
          <Grid item xs={4}>
            <p>Cohesion</p>
          </Grid> 
          <Grid item xs={4}>
            <p>Momentum</p>
          </Grid> 
          <Grid item xs={4}>
            <p>Light Attraction</p>
          </Grid>
          <Grid item xs={4}>
            <p>Fear</p>
          </Grid>
          


          
          
          <Grid item xs={4}>
            <Slider 
              size="small"
              min={0}
              max={10}
              value={this.state.separation}
              onChange={this.handleSeparationChange}>
            </Slider>
          </Grid> 
          <Grid item xs={4}>
            <Slider 
              size="small"
              min={0}
              max={10}
              value={this.state.alignment}
              onChange={this.handleAlignmentChange}>
            </Slider>
          </Grid> 
          <Grid item xs={4}>
            <Slider 
              size="small"
              min={0}
              max={10}
              value={this.state.cohesion}
              onChange={this.handleCohesionChange}>
            </Slider>
          </Grid>
          <Grid item xs={4}>
            <Slider 
              size="small"
              min={0}
              max={10}
              value={this.state.momentum}
              onChange={this.handleMomentumChange}>
            </Slider>
          </Grid>
          <Grid item xs={4}>
            <Slider 
              size="small"
              min={0}
              max={10}
              value={this.state.lightAttraction}
              onChange={this.handleLightAttractionChange}>
            </Slider>
          </Grid>
          <Grid item xs={4}>
            <Slider 
              size="small"
              min={0}
              max={10}
              value={this.state.fear}
              onChange={this.handleFearChange}>
            </Slider>
          </Grid>
          


          {/* <Grid item xs={3}>
            <p>Number of Birds</p>
          </Grid>
          <Grid item xs={3}>
            <p>Number of Predators</p>
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
            <p>Light Attraction</p>
          </Grid>
          <Grid item xs={3}>
            <p>Visual Range</p>
          </Grid>  */}





          {/* <Grid item xs={3}>
            <Slider 
              size="small"
              min={5}
              max={150}
              value={this.state.numBirds}
              onChange={this.handleNumBirdsChange}>
            </Slider>
          </Grid> 
          <Grid item xs={3}>
            <Slider 
              size="small"
              min={0}
              max={20}
              value={this.state.numPredators}
              onChange={this.handleNumPredatorsChange}>
            </Slider>
          </Grid> 
          <Grid item xs={3}>
            <Slider 
              size="small"
              min={0}
              max={10}
              value={this.state.separation}
              onChange={this.handleSeparationChange}>
            </Slider>
          </Grid> 
          <Grid item xs={3}>
            <Slider 
              size="small"
              min={0}
              max={10}
              value={this.state.alignment}
              onChange={this.handleAlignmentChange}>
            </Slider>
          </Grid> 
          <Grid item xs={3}>
            <Slider 
              size="small"
              min={0}
              max={10}
              value={this.state.cohesion}
              onChange={this.handleCohesionChange}>
            </Slider>
          </Grid>
          <Grid item xs={3}>
            <Slider 
              size="small"
              min={0}
              max={10}
              value={this.state.momentum}
              onChange={this.handleMomentumChange}>
            </Slider>
          </Grid>
          <Grid item xs={3}>
            <Slider 
              size="small"
              min={0}
              max={10}
              value={this.state.lightAttraction}
              onChange={this.handleLightAttractionChange}>
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
          </Grid> */}
        </Grid>

        {/* <Container maxWidth="lg">
          <Grid container columnSpacing={4} className="params" columns={8}>
            <Grid item xs={4}>
                <p>Number of Predators</p>
            </Grid>
            <Grid item xs={4}>
                <p>Number of Obstacles</p>
            </Grid>
            <Grid item xs={4}>
                <Select
                  value={this.state.numPredators}
                  onChange={this.handlePredatorChange}
                >
                  <MenuItem value={0}>0</MenuItem>
                  <MenuItem value={1}>1</MenuItem>
                  <MenuItem value={2}>2</MenuItem>
                  <MenuItem value={3}>3</MenuItem>
                  <MenuItem value={4}>4</MenuItem>
                </Select>
            </Grid>
            <Grid item xs={4}>
                <Select
                  value={this.state.numObstacles}
                  onChange={this.handleObstacleChange}
                >
                  <MenuItem value={0}>0</MenuItem>
                  <MenuItem value={1}>1</MenuItem>
                  <MenuItem value={2}>2</MenuItem>
                  <MenuItem value={3}>3</MenuItem>
                  <MenuItem value={4}>4</MenuItem>
                </Select>
            </Grid>
          </Grid>           
        </Container> */}

        <Grid container columnSpacing={2} columns={16} className="buttons">
          <Grid item xs={5}/>
          <Grid item xs={3}>
            <Button 
              color={this.state.running ? "error" : "primary"}
              variant="contained"
              onClick={this.handlePPClick}
              startIcon={this.state.running ? <PauseIcon/> : <PlayIcon/>}
              className="play-pause">
              {this.state.running ? "Pause" : "Play"}
            </Button>
            <Button 
              style={{marginLeft: 10}}
              color="secondary"
              variant="outlined"
              onClick={this.handleAgain}>
              Again!
            </Button>
          </Grid>
          <Grid item xs={3}>
            <Button 
              color="secondary"
              variant="outlined"
              onClick={this.handleRefresh}
              startIcon={<RefreshIcon/>}>
              Reset Parameters
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


