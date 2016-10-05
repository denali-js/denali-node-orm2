import assert from 'assert';
import { ORMAdapter } from 'denali';
import { fromNode } from 'bluebird';
import forIn from 'lodash/forIn';
import forEach from 'lodash/forEach';
import snakeCase from 'lodash/snakeCase';
import upperFirst from 'lodash/upperFirst';

const typeMap = {
  text: 'text',
  number: 'number',
  boolean: 'boolean',
  json: 'object',
  date: 'date'
};

export default class NodeORM2Adapter extends ORMAdapter {

  static find(type, query, options) {
    let AdapterModel = this.adapterModels[type];
    return fromNode((cb) => {
      if ([ 'number', 'string' ].includes(typeof query)) {
        AdapterModel.get(query, cb);
      } else {
        AdapterModel.find(query, cb);
      }
    });
  }

  static createRecord(type, data, options) {
    let AdapterModel = this.adapterModels[type];
    return fromNode((cb) => {
      AdapterModel.create(data, cb);
    });
  }

  static buildRecord(type, data, options) {
    let AdapterModel = this.adapterModels[type];
    return new AdapterModel(data);
  }

  static idFor(model) {
    return model.record.id;
  }

  static getAttribute(model, property) {
    return model.record[property];
  }

  static setAttribute(model, property, value) {
    return model.record[property] = value;
  }

  static deleteAttribute(model, property) {
    return model.record[property] = null;
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

  static define(Model) {
    let attributes = {};
    Model.eachAttribute((key, attribute) => {
      if (attribute.isAttribute) {
        attributes[key] = {
          mapsTo: this.serializeKey(key),
          type: this.typeForAttribute(attribute)
        }
      }
    });
    return this.db.define(Model.type, attributes);
  }

  static defineRelationships(DenaliModel, AdapterModel) {
    let relationships = {};
    forIn(DenaliModel, (value, key) => {
      if (value.isRelationship) {
        relationships[this.serializeKey(key)] = value;
      }
    });
    forEach(relationships, (config, key) => {
      let RelatedAdapterModel = this.adapterModels[config.relatedType];
      if (config.hasOne) {
        AdapterModel.hasOne(key, RelatedAdapterModel);
      } else {
        AdapterModel.hasMany(key, RelatedAdapterModel);
      }
    });
  }

  static serializeKey(key) {
    return snakeCase(key);
  }

  static typeForAttribute(attribute) {
    let type = typeMap[attribute.type];
    assert(type, `"${ attribute.type }" data type is not supported by the node-orm2 adapter. Supported types are: ${ Object.keys(typeMap).join(', ') }`);
    return type;
  }

}


