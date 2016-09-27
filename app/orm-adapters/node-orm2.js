import assert from 'assert';
import { ORMAdapter } from 'denali';
import { fromNode } from 'bluebird';
import forIn from 'lodash/forIn';
import forEach from 'lodash/forEach';
import snakeCase from 'lodash/snakeCase';
import upperFirst from 'lodash/upperFirst';

const typeMap = {
  string: String,
  number: Number,
  boolean: Boolean,
  json: Object,
  date: Date
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

  static idFor(record) {
    return record.id;
  }

  static getAttribute(record, property) {
    return record[property];
  }

  static setAttribute(record, property, value) {
    return record[property] = value;
  }

  static deleteAttribute(record, property) {
    return record[property] = null;
  }

  static getRelated(record, relationship) {
    return fromNode((cb) => {
      record[`get${ upperFirst(relationship) }`](cb);
    });
  }

  static setRelated(record, relationship, relatedRecords) {
    return fromNode((cb) => {
      record[`set${ upperFirst(relationship) }`](relatedRecords, cb);
    });
  }

  static addRelated(record, relationship, relatedRecord) {
    return fromNode((cb) => {
      record[`add${ upperFirst(relationship) }`](relatedRecord, cb);
    });
  }

  static removeRelated(record, relationship, relatedRecord) {
    return fromNode((cb) => {
      let args = [ cb ];
      if (relatedRecord) {
        args.unshift([ relatedRecord ]);
      }
      record[`remove${ upperFirst(relationship) }`](...args);
    });
  }

  static saveRecord(record) {
    return fromNode(record.save.bind(record));
  }

  static deleteRecord(record) {
    return fromNode(record.remove.bind(record));
  }

  static define(Model) {
    let attributes = {};
    forIn(Model, (value, key) => {
      if (value.isAttribute) {
        attributes[this.serializeKey(key)] = this.typeForAttribute(value);
      }
    });
    console.log(Model.type, attributes);
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


