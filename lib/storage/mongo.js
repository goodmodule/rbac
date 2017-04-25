'use strict';

var util = require("util"),
    Storage = require("./index"),
    mongojs = require("mongojs"),
    Permission = require('./../permission'),
    Role = require('./../role'),
    async = require("async"),
    items = mongojs('rbac', ['items']).collection("items");


// no test , only writed.
function MongoStore() {
    Storage.call(this);
}

util.inherits(MongoStore, Storage);

MongoStore.prototype.add = function (item, cb) {
    var name = item.getName();

    if (item instanceof  Role) {
        item.__type = "Role";
    }

    if (item instanceof Permission) {
        item.__type = "Permission"
    }

    items.findOne({name: name}, function (err, rs) {
        if (rs) {
            cb(new Error('Item is already in storage'));
        } else {
            items.save({
                instance: item,
                grants: []
            })
        }

    })
    return this;
};

MongoStore.prototype.remove = function (item, cb) {
    var name = item.getName();
    items.remove({name: name});
    cb(null, true);
};

MongoStore.prototype.grant = function (role, child, cb) {
    var name = role.getName();
    var childName = child.getName();

    if (!role instanceof Role) {
        return cb(new Error('Role is not instance of Role'));
    }

    if (name === childName) {
        return cb(new Error('You can grant yourself'));
    }

    async.parallel([
        function (cb) {
            items.findOne({name: name}, cb);
        },
        function (cb) {
            items.findOne({name: childName}, cb);
        }
    ], function (err, rs) {
        if (rs[0] && rs[1]) {
            rs[0].grants.push(rs[1]);
            items.update({name: name}, rs[0], function () {
                cb(null, true);
            });
        } else {
            cb(new Error('Role is not exist'));
        }
    });

    return this;
};

MongoStore.prototype.revoke = function (role, child, cb) {
    var name = role.getName();
    var childName = child.getName();

    async.parallel([
        function (cb) {
            items.findOne({name: name}, cb);
        },
        function (cb) {
            items.findOne({name: childName}, cb);
        }
    ], function (err, rs) {
        if (rs[0] && rs[1]) {
            rs[0].splice(i, 1);
            items.update({name: name}, rs[0], function () {
                cb(null, true);
            });
        } else {
            cb(new Error('Role is not exist'));
        }
    });

    return this;
};

MongoStore.prototype.get = function (name, cb) {
    items.findOne({name: name}, function (err, rs) {
        cb(null, rs ? rs.instance : null);
    });
};

MongoStore.prototype.getRoles = function (cb) {
    items
        .find({$where: function () {
            if (this.instance.__type === "Role") {
                return true;
            } else {
                return false;
            }
        }})
        .toArray(function (err, rs) {
            cb(null, rs || []);
        })

    return this;
};

MongoStore.prototype.getPermissions = function (cb) {


    items
        .find({$where: function () {
            if (this.instance.__type === "Permission") {
                return true;
            } else {
                return false;
            }
        }})
        .toArray(function (err, rs) {
            cb(null, rs || []);
        })

    return this;
};

MongoStore.prototype.getGrants = function (name, cb) {
    items.findOne({name: name}, function (err, rs) {
        cb(null, rs ? rs.grants : null);
    });
    return this;
};

module.exports = Memory;