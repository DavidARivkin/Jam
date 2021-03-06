import Rx from 'rx'
const {merge} = Rx.Observable
import assign from 'fast.js/object/assign' // faster object.assign
import { domElementToImage } from '../../utils/imgUtils'

export default function api (actions, state$) {
  const transforms$ = actions.apiActions
    .getTransforms$
    .withLatestFrom(state$.pluck('transforms'), function (request, transforms) {
      // console.log("getTransforms",request,transforms)
      const transformsList = Object.keys(transforms).reduce(function (acc, key) {
        let trs = assign({}, transforms[key], {id: key})
        let out = acc.concat([trs])
        return out
      }, [])
      return {
        request,
        response: transformsList,
        requestName: 'getTransforms'
      }
    })

  const status$ = actions.apiActions
    .getStatus$
    .withLatestFrom(state$.pluck('settings'), function (request, settings) {
      const response = {
        activeTool: settings.activeTool
      }
      return {request, response, requestName: 'getStatus'}
    })

  const screenCapture$ = actions.apiActions
    .captureScreen$
    .map(function (data) {
      let {request, element} = data
      let img = domElementToImage(element)
      return {request, response: img, requestName: 'captureScreen'}
    })

  const apiOutputs$ = merge(
    transforms$
    , status$
    , screenCapture$)

  // for now stop gap solution
  // specific sinks, this requires us knowing the origin of the actions ...
  // ie TODO!!!
  const postMsg$ = apiOutputs$
    .map(data => {
      const {request, response, requestName} = data
      return {target: request.source, message: response, targetOrigin: request.origin, requestName}
    })

  return {outputs$: apiOutputs$, postMsg$}
}
