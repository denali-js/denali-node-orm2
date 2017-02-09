import { fromNode } from 'bluebird';

export default {
  name: 'sync-database',
  after: 'define-orm-models',
  async initialize(application) {
    let container = application.container;
    let adapter = container.lookup('orm-adapter:node-orm2');

    if (application.config.database.syncSchema) {
      await fromNode((cb) => adapter.db.sync(cb));
    }
  }
};
