import { fromNode } from 'bluebird';
import orm from 'orm';

export default {
  name: 'node-orm2-connect',
  before: 'define-orm-models',
  async initialize(application) {
    let container = application.container;
    let config = application.config;

    if (!config.database || !config.database.orm2) {
      // Config is not specified
      return;
    }

    try {
      let connection = await fromNode((cb) => orm.connect(config.database.orm2, cb));
      container.register('database:orm2', connection, { singleton: true });
    } catch (error) {
      application.logger.error('Error initializing the node-orm2 adapter or database connection:');
      application.logger.error(error.stack);
    }
  }
};
