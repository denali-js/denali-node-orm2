import { ORMAdapter } from 'denali';
import { fromNode } from 'bluebird';
import snakeCase from 'lodash/snakeCase';
import upperFirst from 'lodash/upperFirst';
import assign from 'lodash/assign';

export default class NodeORM2Adapter extends ORMAdapter {

  find(type, id) {
    let OrmModel = this.ormModels[type];
    return fromNode((cb) => OrmModel.get(id, cb));
  }

  all(type, options = {}) {
    let OrmModel = this.ormModels[type];
    return fromNode((cb) => OrmModel.all(null, options, cb));
  }

  query(type, query, options = {}) {
    let OrmModel = this.ormModels[type];
    return fromNode((cb) => OrmModel.find(query, options, cb));
  }

  findOne(type, query) {
    let OrmModel = this.ormModels[type];
    return fromNode((cb) => OrmModel.one(query, cb));
  }

  createRecord(type, data) {
    let OrmModel = this.ormModels[type];
    return fromNode((cb) => OrmModel.create(data, cb));
  }

  buildRecord(type, data) {
    let OrmModel = this.ormModels[type];
    return new OrmModel(data);
  }

  idFor(model) {
    return model.record.id;
  }

  getAttribute(model, property) {
    return model.record[property];
  }

  setAttribute(model, property, value) {
    model.record[property] = value;
    return true;
  }

  deleteAttribute(model, property) {
    model.record[property] = null;
    return true;
  }

  getRelated(model, relationship) {
    return fromNode((cb) => {
      model.record[`get${ upperFirst(relationship) }`](cb);
    });
  }

  setRelated(model, relationshipName, relationshipDefinition, relatedModels) {
    // If relatedRecords is an array (e.g. a hasMany relationship), we need to get all of the actual record instances,
    // so we pass it through a map function. Otherwise, we just get the single record
    let related = Array.isArray(relatedModels) ? relatedModels.map((relatedModel) => relatedModel.record) : relatedModels.record;

    return fromNode((cb) => {
      model.record[`set${ upperFirst(relationshipName) }`](related, cb);
    });
  }

  addRelated(model, relationshipName, relationshipDefinition, { record: relatedRecord }) {
    return fromNode((cb) => {
      model.record[`add${ upperFirst(relationshipName) }`](relatedRecord, cb);
    });
  }

  removeRelated(model, relationshipName, relationshipDefintion, { record: relatedRecord }) {
    return fromNode((cb) => {
      let args = [ cb ];
      if (relatedRecord) {
        args.unshift([ relatedRecord ]);
      }
      model.record[`remove${ upperFirst(relationshipName) }`](...args);
    });
  }

  saveRecord(model) {
    return fromNode(model.record.save.bind(model.record));
  }

  deleteRecord(model) {
    return fromNode(model.record.remove.bind(model.record));
  }

  defineModels(models) {
    // Don't define abstract base classes
    models = models.filter((Model) => !(Model.hasOwnProperty('abstract') && Model.abstract));

    this.ormModels = {};

    // Define models
    models.forEach((Model) => {
      let attributes = {};
      Model.eachAttribute((key, attribute) => {
        attributes[key] = assign({
          mapsTo: this.keyToColumn(key),
          type: this.denaliTypeToORMType(attribute.type)
        }, attribute.options);
      });
      this.ormModels[Model.type] = this.db.define(Model.type, attributes);
    });

    // Define relationships between models
    models.forEach((Model) => {
      Model.eachRelationship((key, relationship) => {
        let OrmModel = this.ormModels[Model.type];
        let Related = this.ormModels[relationship.type];
        if (relationship.mode === 'hasOne') {
          OrmModel.hasOne(key, Related);
        } else {
          OrmModel.hasMany(key, Related);
        }
      });
    });
  }

  denaliTypeToORMType(denaliType) {
    return denaliType;
  }

  keyToColumn(key) {
    return snakeCase(key);
  }

}
