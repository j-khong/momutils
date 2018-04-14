// Import Tinytest from the tinytest Meteor package.
import DevUtils from "@jkhong/devutils";
import { Tinytest } from "meteor/tinytest";
import { name as packageName } from "meteor/jkhong:momutils";
import { MomUtils } from "meteor/jkhong:momutils";

Tinytest.add('momutils - example', function (test) {
  test.equal(packageName, "momutils");
});

Tinytest.add('momutils - create a database utilities object', function (test) {
  NS = {
    Database: {
      Cars: {
      }
    }
  }
  const collname = 'cars';
  MomUtils.Database.create(NS, collname);

  test.isTrue(DevUtils.isSet(NS.Model))
  test.isTrue(DevUtils.isSet(NS.Model.Classes))
  test.isTrue(DevUtils.isSet(NS.Model.Schemas))
  test.isTrue(DevUtils.isSet(NS.Methods))
  test.isTrue(DevUtils.isSet(NS.Requests))
  test.isTrue(DevUtils.isSet(NS.Model.ColName));
  test.equal(NS.Model.ColName, collname);
});
