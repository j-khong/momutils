import DevUtils from "@jkhong/devutils";
import SimpleSchema from "simpl-schema";
import { Meteor } from "meteor/meteor";
import { Mongo } from "meteor/mongo";
import { ReactiveVar } from "meteor/reactive-var";

export const name = "momutils";

MomUtils = {
  Database: {
    create: function (entity, collName) {
      entity.Model = {
        Classes: {},
        Schemas: {},
        Coll: {
          DenyRules: {
            insert(userId, doc) { return true; },
            update(userId, doc, fields, modifier) { return true; },
            remove(userId, doc) { return true; },
          },
        },
      };
      if (DevUtils.isSet(collName)) {
        entity.Model.ColName = collName;
      }
      entity.Methods = {};
      entity.Requests = {
        subscribe: function (tpl, callback) {
          entity.Requests.subscribeTo(entity.Model.ColName, null, tpl, callback);
        },
        subscribeTo: function (collname, data, tpl, callback) {
          tpl.subscribe(collname, data, {
            onReady: () => { if (DevUtils.isSet(callback)) { callback(tpl); } },
          });
        },
        toSelect: function (coll, text, value, infilter, i18n) {
          return toSelect(coll, text, value, "label", "value", infilter, i18n);
        },
        toSelect2: function (coll, text, value, infilter, i18n) {
          return toSelect(coll, text, value, "text", "id", infilter, i18n);
        },
        getByKey: function (data) {
          entity.Model.Schemas.Main.validate(data.getData());
          return entity.Model.Col.findOne(data.getKey());
        },
        getById: function (data) {
          entity.Model.Schemas.Main.validate(data.getData());
          return entity.Model.Col.findOne({ _id: data.getId() });
        },
        find(selector) {
          if (DevUtils.isNotSet(selector)) { selector = {}; }
          return entity.Model.Col.find(selector).fetch();
        },
        findOne(selector) {
          if (DevUtils.isNotSet(selector)) { selector = {}; }
          return entity.Model.Col.findOne(selector);
        },
        findObjects(selector) {
          if (DevUtils.isNotSet(selector)) { selector = {}; }
          return entity.Model.Col.find(selector, {
            transform: (doc) => new entity.Model.Classes.Main(doc),
          }).fetch();
        },
        findOneObject(selector) {
          if (DevUtils.isNotSet(selector)) { selector = {}; }
          return entity.Model.Col.findOne(selector, {
            transform: (doc) => new entity.Model.Classes.Main(doc),
          });
        },
      };
      entity.Functions = {
        initColl: function (theclass) {
          let model = entity.Model;
          model.Classes.Main = theclass;
          if (DevUtils.isSet(model.ColName)) {
            model.Col = new Mongo.Collection(model.ColName);
            if (DevUtils.isNotSet(model.Schemas.Main)) {
              throw Error("please set a schema (to be attached to mongo collection) in Model.Schemas.Main");
            }
            model.Col.attachSchema(model.Schemas.Main);
            model.Col.deny(model.Coll.DenyRules);
          }
        },
      };
    },
    dbClass: class DB {
      constructor(schema, data) {// always pass data struct (e.g. from db), don't pass objects
        if (!(schema instanceof SimpleSchema)) {
          throw Error("please provide a Simple schema object");
        }
        this.schema = schema;

        this.schema.extend(new SimpleSchema({
          _id: { type: String, regEx: SimpleSchema.RegEx.Id, optional: true },
        }));

        this.init(data);
      }

      getSchema() { return this.schema; }

      init(data) {
        this.schema.validate(data);
        this.data = data;
      }

      getData() { return this.data; }

      getKey() { throw new Error("getKey is not implemented in class " + this.constructor.name); }

      setId(id) {
        this.data._id = id;
        return this;
      }

      getId() { return this.data._id; }
    },
  },
  Client: {
    UI: {
      uiClass: class Vue {
        constructor(timeout) {
          this.timeout = timeout;
          this.currentTpl = new ReactiveVar(null);
          this.errorMsg = new ReactiveVar(null);
          this.msg = new ReactiveVar(null);
        }

        getCurrentTemplate() { return this.currentTpl.get(); }

        setCurrentTemplate(tpl) { return this.currentTpl.set(tpl); }

        getErrorMsg() { return this.errorMsg.get(); }

        getMsg() { return this.msg.get(); }

        resetError() { this.errorMsg.set(null); }

        onError(msg) { this._setTempVal(this.errorMsg, msg); }

        onMsg(msg) { this._setTempVal(this.msg, msg); }

        _setTempVal(reactvar, val) {
          reactvar.set(val);
          Meteor.setTimeout(function () {
            reactvar.set(null);
          }, this.timeout);
        }
      },
    },
  },
};

function toSelect(coll, text, value, optFieldName, optValueFieldName, infilter, i18n) {
  let filter = {};
  if (infilter) { filter = infilter; }

  var aData = coll.find(filter);
  select = aData.map(function (data) {
    let obj = {};
    let val = data[text];
    if (DevUtils.isSet(i18n)) { val = i18n(data, text); }

    obj[optFieldName] = val;
    obj[optValueFieldName] = data[value];
    return obj;
  });
  return select;
}

export { MomUtils };
