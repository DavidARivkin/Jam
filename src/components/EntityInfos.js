import React from 'react'
import Rx from 'rx'
let Observable= Rx.Observable
let fromEvent = Observable.fromEvent

import {formatNumberTo, absSizeFromBBox} from '../utils/formatters'

import logger from '../utils/log'
let log = logger("Jam-ToolBar")
log.setLevel("info")

import {setEntityData$, setEntityBBox} from '../actions/entityActions'

import EditableItem from './EditableItem'
import ColorPicker from 'react-color-picker'
/*
  Component to display (& edit) some of the main properties of entities: ie
  - position
  - rotation 
  - scale
*/
class EntityInfos extends React.Component {
  constructor(props) {
    super(props)
    this.state={entityName:""}
    this.degreeAngles = true
  }

  componentWillReceiveProps(nextProps){
    let entities = nextProps.entities
    if(entities && entities.length >0 )
    {
      this.setState({
        entityName:entities[0].name
      })
    }
  }

  /*getStateStream() {
    //return (
    //  Observable.empty())
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
    )
  }*/

  _keyup(event){
    console.log(event)
    this.setState({results: event.target.value})
  }

  handleChange(type, index, event) {
    console.log(type, index, parseFloat(event.target.value))
    //this.setState({value: event.target.value})
    let entity= this.props.entities[0] 
    let transforms = {
      pos:Object.assign([],entity.pos),
      rot:Object.assign([],entity.rot),
      sca:Object.assign([],entity.sca),
    }
    transforms[type][index]=parseFloat(event.target.value)
    
    let data = transforms
    data["entity"] = entity
    setEntityData$(data)
  }

  handleSizeChange(index, event) {
    console.log("handling size change", index, parseFloat(event.target.value))
    //this.setState({value: event.target.value})
    let entity= this.props.entities[0] 
    let bbox = {
      min:Object.assign([],entity.bbox.min),
      max:Object.assign([],entity.bbox.max),
    }
    let value = parseFloat(event.target.value)
    //attrs[type][index]=parseFloat(event.target.value)
    //TODO: convert abs size to bbox
    //bbox.min[index] = value/2
    //bbox.max[index] = value/2
    
    setEntityBBox({entity, bbox})
  }

  handleAngleInput(event){
    let value = event.target.value
  }

  handleColorChange(event){
    let entity= this.props.entities[0] 
    let color = event.target.value
    this.handleEntityDataChange("color",entity,color)
  }

  handleEntityDataChange(field, entity, value){
    console.log("entity data bla ",field, value, entity)// this.props.entities[0] )
    let data = {}
    data[field]  = value
    data["entity"] = entity
    setEntityData$(data)
  }

  
  render() {
    //let styles = Object.assign({}, this.constructor.styles)
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
    let entityInfo
    let canDisplay = this.props.entities.length>0
    let debug  = this.props.debug || false

    let numberPrecision = 2
    let controlsStep = 0.1

    let entityName = this.state && this.state.entityName || []


    if(canDisplay){
      let entity= this.props.entities[0] 
      //let absSize = toAbsSize(entity.sca)

      let self  = this//workaround for babel + jsx "this" issue

      let entityColor = null
      if(entity.color){
        entityColor = (
           <span>
            <input type="color" value={entity.color} onChange={this.handleColorChange.bind(this)}/> 
          </span>
        )
      }  

      let positionInputs = []
      if(entity.pos){
        entity.pos.forEach(function(entry, index){
          let entry = formatNumberTo(entry, numberPrecision)
          positionInputs.push(<input type="number" 
            value={entry} 
            step= {controlsStep}
            style={styles.numbers} 
            onChange={self.handleChange.bind(self,"pos",index)} />
          )
        })

        positionInputs = (
          <span>
            <span>P:</span> {positionInputs}
          </span>
        )
      }

      let rotationInputs = []
      if(entity.rot){
        entity.rot.forEach(function(entry, index){
          let entry = formatNumberTo(entry, numberPrecision)
          rotationInputs.push(<input type="number"
            value={entry} 
            step = {controlsStep}
            style={styles.numbers}
            onChange={self.handleChange.bind(self,"rot",index)} />
          )
        })

        rotationInputs = (
          <span>
            <span>R:</span> {rotationInputs}
          </span>
        )
      }

      let scaleInputs = []
      if(entity.sca){
        entity.sca.forEach(function(entry, index){
          let entry = formatNumberTo(entry, numberPrecision)
          scaleInputs.push(
            <input type="number" 
            value={entry} 
            step={controlsStep}
            style={styles.numbers}
            onChange={self.handleChange.bind(self,"sca",index)} />
          )
        })

        scaleInputs = (
          <span>
            <span>S:</span> {scaleInputs}
          </span>
        )
      }

      let absSizeInputs = []
      if(entity.bbox){
        let absSize = absSizeFromBBox(entity.bbox)
        absSize = absSize || {w:0,l:0,h:0}
        //convert to array to keep logic the same for all fields
        absSize = [absSize.w,absSize.l,absSize.h]
        absSize.forEach(function(entry, index){
          let entry = formatNumberTo(entry, numberPrecision)
          absSizeInputs.push(
            <input type="number" 
            value={entry} 
            step={controlsStep}
            style={styles.numbers} onChange={self.handleSizeChange.bind(self,index)}/>
          )
        })

        absSizeInputs = (
          <span>
            <span>D:</span> {absSizeInputs}
          </span>
        )
      }

      //this is used only for annotations I guess?
      let extraFields =null
      if(entity.value){
        extraFields = (
          <span> value:{ formatNumberTo(entity.value, numberPrecision) }</span>
        )
      }

      let debugFields = undefined

      if(debug){
        debugFields = <div>
          <span> iuid: </span> <span>{entity.iuid}</span>
          <span> tuid: </span> <span>{entity.typeUid}</span>
          </div>
      }


      entityInfo = null

      if(this.props.mode !== "viewer")
      {
        entityInfo = (
        <div>

          {entityColor}

          <span>
            <span>N:</span>
            <EditableItem data={entityName} changeCallback={ this.handleEntityDataChange.bind(this,"name",entity) }/> 
          </span>
          
          {positionInputs}

          {rotationInputs}

          {scaleInputs}
        
          {absSizeInputs}

          {extraFields}

          {debugFields}
        </div>)
      }
    }
    
    return (
      <div>
       {entityInfo}
      </div>
    )
  }
}

export default EntityInfos