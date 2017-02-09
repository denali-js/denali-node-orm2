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
    return value;
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

  setRelated(model, relationship, relatedRecords) {
    return fromNode((cb) => {
      model.record[`set${ upperFirst(relationship) }`](relatedRecords, cb);
    });
  }

  addRelated(model, relationship, relatedRecord) {
    return fromNode((cb) => {
      model.record[`add${ upperFirst(relationship) }`](relatedRecord, cb);
    });
  }

  removeRelated(model, relationship, relatedRecord) {
    return fromNode((cb) => {
      let args = [ cb ];
      if (relatedRecord) {
        args.unshift([ relatedRecord ]);
      }
      model.record[`remove${ upperFirst(relationship) }`](...args);
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
