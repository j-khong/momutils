import DevUtils from "@jkhong/devutils";
import { Meteor } from "meteor/meteor";
import { Mongo } from "meteor/mongo";
import { ReactiveVar } from "meteor/reactive-var";
import { check } from "meteor/check";

export const name = "momutils";

MomUtils = {
  Database: {
    create: function (entity, collName) {
      entity.Model = {
        Classes: {},
        Schemas: {},
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
          check(data, entity.Model.Schemas.Main);
          return entity.Model.Col.findOne(data.getKey());
        },
        getById: function (data) {
          check(data, entity.Model.Schemas.Main);
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
            model.Col.attachSchema(model.Schemas.Main);
          }
        },
      };
    },
    dbClass: class DB {
      constructor(schema) { this.schema = schema; }

      checkData() { check(this.data, this.schema); }

      init(data) {
        check(data, this.schema);
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
