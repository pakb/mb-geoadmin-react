import { TOGGLE_LAYER_VISIBILITY } from "./action-names"

export function toggleLayerVisibility (payload) {
    return { type: TOGGLE_LAYER_VISIBILITY, payload }
};
