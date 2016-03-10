import {nameCleanup} from '../../../utils/formatters'
import {head} from 'ramda'


/*
import {nameCleanup} from '../../utils/formatters'
import {head} from 'ramda'


export function intentsFromResources(rawParsedData$){

    const data$ = rawParsedData$
      .share()

    const entityCandidates$ = data$//for these we need to infer type , metadata etc
      .filter(d=>d.data.meshOnly === true)
      .map(({meta,data})=>({data:head(data.typesMeshes).mesh, meta}))
      //.tap(e=>console.log("entityCandidates",e))


    const entityCertains$ = data$//for these we also have type, metadata etc, so we are CERTAIN of their data
      .filter(d=>d.data.meshOnly === false)
      //.tap(e=>console.log("entityCertains",e))

    return {
        entityCandidates$
      , entityCertains$
    }
  }

  export function makeEntityActionsFromResources(certains$){
    certains$ = certains$
    const createMetaComponents$      = certains$.map(data=>data.data.instMeta)
      //NOTE :we are doing these to make them compatible with remapMetaActions helpers, not sure this is the best
      .map(function(datas){
        return datas.map(function({instUid, typeUid, name}){
          return { id:instUid,  value:{ id:instUid, typeUid, name } }
        })
      })
    const createTransformComponents$ = certains$.map(data=>data.data.instTransforms)
      .map(function(datas){
        return datas.map(function({instUid, transforms}){
          return { id:instUid, value:{pos:[transforms[11],transforms[10],transforms[9]]} }
        })
      })
    const createMeshComponents$      = certains$.map(function(data){
      return data.data.instMeta.map(function(instMeta){
          let meshData = head( data.data.typesMeshes.filter(mesh=>mesh.typeUid === instMeta.typeUid) )
          return {
            id:instMeta.instUid
            ,value:{mesh:meshData.mesh.clone()}
          }
        })
    })

     //TODO : this would need to be filtered based on pre-existing type data
    const addTypes$ = certains$
      .map(function(data){
        return data.data.typesMeta.map(function(typeMeta,index){
          if(typeMeta.name === undefined){//we want type names in any case, so we infer this base on "file" name
            typeMeta.name = nameCleanup( data.meta.name )
            if(index>0){
              typeMeta.name = typeMeta.name+index
            }
          }
          return typeMeta
        })
      })

    return {
        addTypes$
      , createMetaComponents$
      , createTransformComponents$
      , createMeshComponents$
    }
  }
*/

//helper function to extract certain & infer data
export default function intentsFromResources(rawParsedData$){

  const data$ = rawParsedData$
    .share()

  const candidates$ = data$//for these we need to infer type , metadata etc
    .filter(d=>d.data.meshOnly === true)
    .map(({meta,data})=>({data:head(data.typesMeshes).mesh, meta}))
    //.tap(e=>console.log("entityCandidates",e))

  //these MIGHT become instances, or something else, we just are not 100% sure
  const certains$ = data$//for these we also have type, metadata etc, so we are CERTAIN of their data
    .filter(d=>d.data.meshOnly === false)
    //.tap(e=>console.log("entityCertains",e))

  return {
      candidates$
    , certains$
  }
}

export default function intents(resources, params){
  const {certains$, candidates$} = intentsFromResources(resources)

  const addInstanceCandidates$ = candidates$.filter(data=>data.meta.flags!=='noInfer').tap(e=>console.log("entityCandidates",e))
  const addTypeCandidate$      = candidates$.filter(data=>data.meta.id === undefined)

  //components
  const createMetaComponents$      = certains$.map(data=>data.data.instMeta)
    //NOTE :we are doing these to make them compatible with remapMetaActions helpers, not sure this is the best
    .map(function(datas){
      return datas.map(function({instUid, typeUid, name}){
        return { id:instUid,  value:{ id:instUid, typeUid, name } }
      })
    })
  const createTransformComponents$ = certains$.map(data=>data.data.instTransforms)
    .map(function(datas){
      return datas.map(function({instUid, transforms}){
        return { id:instUid, value:{pos:[transforms[11],transforms[10],transforms[9]]} }
      })
    })
  const createMeshComponents$      = certains$.map(function(data){
    return data.data.instMeta.map(function(instMeta){
        let meshData = head( data.data.typesMeshes.filter(mesh=>mesh.typeUid === instMeta.typeUid) )
        return {
          id:instMeta.instUid
          ,value:{mesh:meshData.mesh.clone()}
        }
      })
  })

   //TODO : this would need to be filtered based on pre-existing type data
  const addTypes$ = certains$
    .map(function(data){
      return data.data.typesMeta.map(function(typeMeta,index){
        if(typeMeta.name === undefined){//we want type names in any case, so we infer this base on "file" name
          typeMeta.name = nameCleanup( data.meta.name )
          if(index>0){
            typeMeta.name = typeMeta.name+index
          }
        }
        return typeMeta
      })
    })

  //
  const alreadyExistingTypeMeshData$ = resources
      .filter(data=>data.meta.id !== undefined)
      //.forEach(e=>console.log("alreadyExistingTypeMeshData",e))

  //create new part type from basic type data & mesh data
  const addTypeFromTypeAndMeshData$ = alreadyExistingTypeMeshData$
    .map(function(entry){
      const data = entry.data.typesMeshes[0].mesh
      const meta = {
        name:nameCleanup( entry.meta.name )
        ,id:entry.meta.id
      }
       return {id:entry.meta.id, data, meta}
     })
     //.tap(e=>console.log("addEntityTypesFromPostMessage",e))

  return {
      addTypes$:addTypes$.merge(addTypeFromTypeAndMeshData$)
    , addTypeCandidate$
    , addInstanceCandidates$
    , createMetaComponents$
    , createTransformComponents$
    , createMeshComponents$
  }
}
