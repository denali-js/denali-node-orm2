import { fromNode } from 'bluebird';
import orm from 'orm';
import mapValues from 'lodash/mapValues';
import forEach from 'lodash/forEach';

export default {
  name: 'node-orm2',
  initialize(application) {
    let container = application.container;
    let adapter = container.lookup('orm-adapter:node-orm2');
    if (application.config.ormAdapter === 'node-orm2') {
      container.register('orm-adapter:application', adapter);
    }
    let config = application.config.database;

    return fromNode((cb) => {
        orm.connect(config.url, cb);
      }).then((db) => {
        adapter.db = db;
        let models = container.lookupAll('model');
        let adapterModels = mapValues(models, (Model) => {
          if (Model.hasOwnProperty('abstract') && Model.abstract) {
            return;
          }
          return adapter.define(Model);
        });
        adapter.adapterModels = adapterModels;
        adapter.models = models;
        forEach(adapterModels, (AdapterModel, type) => {
          adapter.defineRelationships(models[type], AdapterModel);
        });

        if (config.syncSchema) {
          return fromNode(db.sync.bind(db));
        }
      }).catch((error) => {
        application.logger.error('Error initializing the node-orm2 adapter or database connection:');
        application.logger.error(error.stack);
      });
  }
};
