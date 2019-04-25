import configureLayerModule from './layer';

import { extractActions, extractReducers } from './extract';

const configureModules = async (services) => {
  const layerModule = configureLayerModule(services);

  const modules = {
    layer: layerModule
  };

  return {
    actions: extractActions(modules),
    reducers: extractReducers(modules),
  };
};

export default configureModules;