import { TOGGLE_LAYER_VISIBILITY } from "./action-names"

import LayerService from "../services/layer.service"

const initialState = {
    layers: []
}

function rootReducer(state = initialState, action) {
    if (action.type === TOGGLE_LAYER_VISIBILITY) {
        const layer = action.payload;
        const visibleLayer = LayerService.getVisibleLayer(layer.id)
    }
    return state;
}

export default rootReducer;