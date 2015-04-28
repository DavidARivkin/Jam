import RxReact from 'rx-react';
import React from 'react';
let StateStreamMixin = RxReact.StateStreamMixin;
let FuncSubject      = RxReact.FuncSubject;

import Rx from 'rx'
let Observable= Rx.Observable;
let fromEvent = Observable.fromEvent;

import {formatNumberTo, toAbsSize} from '../utils/formatters'

import logger from '../utils/log'
let log = logger("Jam-ToolBar");
log.setLevel("info");

import {setEntityTransforms} from '../actions/entityActions'

/*
  Component to display (& edit) some of the main properties of entities: ie
  - position
  - rotation 
  - scale
*/
class EntityInfos extends RxReact.Component {
  constructor(props) {
    super(props);
    this.state={entityName:""}
    this.keyup = FuncSubject.create();

    this.degreeAngles = true;
  }

  componentWillReceiveProps(nextProps){
    let entities = nextProps.entities;
    if(entities && entities.length >0 )
    {
      this.setState({
        entityName:entities[0].name
      })
    }
  }

  getStateStream() {
    //return (
    //  Observable.empty());
    function loggg(text){
      console.log("here",text)
      return text
    }
    return (
      this.keyup
      .map((e) => e.target.value)
      .filter(text => text.length > 2)
      //.throttle(750)
      .distinctUntilChanged()
      //.flatMapLatest(text => searchWikipedia(text))
      //.map(loggg)
      .map(results => ({entityName: results}))
    );
  }

  _keyup(event){
    console.log(event)
    this.setState({results: event.target.value});
  }

  handleChange(type, index, event) {
    console.log(type, index, parseFloat(event.target.value));
    //this.setState({value: event.target.value});
    let entity= this.props.entities[0] ;
    let attrs = {
      pos:Object.assign([],entity.pos),
      rot:Object.assign([],entity.rot),
      sca:Object.assign([],entity.sca),
    };
    attrs[type][index]=parseFloat(event.target.value);
    
    setEntityTransforms(entity,attrs)
  }

  handleAngleInput(event){
    let value = event.target.value;
  }

  
  render() {
    //let styles = Object.assign({}, this.constructor.styles);
    let styles ={
      numbers:{
        width:"10em",
        maxWidth: "50px",
        border: "none",
        lineHeight: "0.8em",
        fontSize: "0.8em",
        fontFamily: "inherit",
      },
      text:{
        maxWidth: "150px",
        border: "none",
        lineHeight: "0.8em",
        fontSize: "0.8em",
        fontFamily: "inherit",
      }

    }

    let fieldStyle={
      width:"10em",
      maxWidth: "50px",
      border: "none",
      lineHeight: "0.8em",
      fontSize: "0.8em",
      fontFamily: "inherit",
    }

    /*let entity ={
      name:"foo",
      type:"yeah",
      pos : [10,0,-7],
      rot : [0,0,7],
      sca: [0,0,0]
    }*/
    let entityInfo;
    let canDisplay = this.props.entities.length>0;

    let numberPrecision = 2;
    let controlsStep = 0.1;

    var entityName = this.state && this.state.entityName || [];


    if(canDisplay){
      let entity= this.props.entities[0] ;
      //let absSize = toAbsSize(entity.sca)

      let self  = this;//workaround for babel + jsx "this" issue

      let positionInputs = [];
      entity.pos.forEach(function(entry, index){
        let entry = formatNumberTo(entry, numberPrecision);
        positionInputs.push(<input type="number" 
          value={entry} 
          step= {controlsStep}
          style={styles.numbers} 
          onChange={self.handleChange.bind(self,"pos",index)} />);
      })

      let rotationInputs = [];
      entity.rot.forEach(function(entry, index){
        let entry = formatNumberTo(entry, numberPrecision);
        rotationInputs.push(<input type="number"
          value={entry} 
          step = {controlsStep}
          style={styles.numbers}
          onChange={self.handleChange.bind(self,"rot",index)} />);
      })

      let scaleInputs = [];
      entity.sca.forEach(function(entry, index){
        let entry = formatNumberTo(entry, numberPrecision);
        scaleInputs.push(
          <input type="number" 
          value={entry} 
          step={controlsStep}
          style={styles.numbers}
          onChange={self.handleChange.bind(self,"sca",index)} />);
      })

      let absSizeInputs = [];
      console.log("BBOX",entity.bbox)
      entity.sca.forEach(function(entry, index){
        let entry = formatNumberTo(entry, numberPrecision);
        absSizeInputs.push(
          <input type="number" 
          value={entry} 
          step={controlsStep}
          style={styles.numbers}
          onChange={self.handleChange.bind(self,"sca",index)} />
          );
      })


      entityInfo = (
        <div>
          <span>
            <span>N:</span>
            <input type="text" value={entityName} style={styles.text} onChange={this.keyup.bind(this)}> </input>
          </span>
          <span>
            <span>P:</span> {positionInputs}
          </span>
          <span>
            <span>R:</span> {rotationInputs}
          </span>
          <span>
            <span>S:</span> {scaleInputs}
          </span>
          <span>
            <span>D:</span> {absSizeInputs}
          </span>
        </div>)
    }
    
    return (
      <div>
       {entityInfo}
      </div>
    );
  }
}

export default EntityInfos