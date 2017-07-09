import { fromNode } from 'bluebird';

export default {
  name: 'sync-database',
  after: 'define-orm-models',
  async initialize(application) {
    let container = application.container;
    let db = container.lookup('database:orm2', { loose: true });

    if (db && application.config.database.sync) {
      await fromNode((cb) => db.sync(cb));
    }
  }
};
