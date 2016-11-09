import { ORMAdapter } from 'denali';
import { fromNode } from 'bluebird';
import snakeCase from 'lodash/snakeCase';
import upperFirst from 'lodash/upperFirst';

export default class NodeORM2Adapter extends ORMAdapter {

  static find(type, query /* , options */) {
    let OrmModel = this.ormModels[type];
    return fromNode((cb) => {
      if ([ 'number', 'string' ].includes(typeof query)) {
        OrmModel.get(query, cb);
      } else {
        OrmModel.find(query, cb);
      }
    });
  }

  static createRecord(type, data /* , options */) {
    let OrmModel = this.ormModels[type];
    return fromNode((cb) => {
      OrmModel.create(data, cb);
    });
  }

  static buildRecord(type, data /* , options */) {
    let OrmModel = this.ormModels[type];
    return new OrmModel(data);
  }

  static idFor(model) {
    return model.record.id;
  }

  static getAttribute(model, property) {
    return model.record[property];
  }

  static setAttribute(model, property, value) {
    model.record[property] = value;
    return true;
  }

  static deleteAttribute(model, property) {
    model.record[property] = null;
    return true;
  }

  static getRelated(model, relationship) {
    return fromNode((cb) => {
      model.record[`get${ upperFirst(relationship) }`](cb);
    });
  }

  static setRelated(model, relationship, relatedRecords) {
    return fromNode((cb) => {
      model.record[`set${ upperFirst(relationship) }`](relatedRecords, cb);
    });
  }

  static addRelated(model, relationship, relatedRecord) {
    return fromNode((cb) => {
      model.record[`add${ upperFirst(relationship) }`](relatedRecord, cb);
    });
  }

  static removeRelated(model, relationship, relatedRecord) {
    return fromNode((cb) => {
      let args = [ cb ];
      if (relatedRecord) {
        args.unshift([ relatedRecord ]);
      }
      model.record[`remove${ upperFirst(relationship) }`](...args);
    });
  }

  static saveRecord(model) {
    return fromNode(model.record.save.bind(model.record));
  }

  static deleteRecord(model) {
    return fromNode(model.record.remove.bind(model.record));
  }

  static defineModels(models) {
    // Don't define abstract base classes
    models = models.filter((Model) => !(Model.hasOwnProperty('abstract') && Model.abstract));

    this.ormModels = {};

    // Define models
    models.forEach((Model) => {
      let attributes = {};
      Model.eachAttribute((key, attribute) => {
        attributes[key] = {
          mapsTo: this.keyToColumn(key),
          type: this.denaliTypeToORMType(attribute.type)
        };
      });
      this.ormModels[Model.type] = this.db.define(Model.type, attributes);
    });

    // Define relationships between models
    models.forEach((Model) => {
      Model.eachRelationship((key, relationship) => {
        let Related = this.ormModels[relationship.relatedType];
        if (relationship.hasOne) {
          Model.hasOne(key, Related);
        } else {
          Model.hasMany(key, Related);
        }
      });
    });
  }

  static denaliTypeToORMType(denaliType) {
    return denaliType;
  }

  static keyToColumn(key) {
    return snakeCase(key);
  }

}
