import { fromNode } from 'bluebird';
import orm from 'orm';

export default {
  name: 'node-orm2-connect',
  before: 'define-orm-models',
  async initialize(application) {
    let container = application.container;
    let adapter = container.lookup('orm-adapter:node-orm2');
    let config = application.config.database;

    try {
      adapter.db = await fromNode((cb) => orm.connect(config.url, cb));
    } catch (error) {
      application.logger.error('Error initializing the node-orm2 adapter or database connection:');
      application.logger.error(error.stack);
    }
  }
};
