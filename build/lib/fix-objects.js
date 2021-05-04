var __create = Object.create;
var __defProp = Object.defineProperty;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropSymbols = Object.getOwnPropertySymbols;
var __propIsEnum = Object.prototype.propertyIsEnumerable;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, {enumerable: true, configurable: true, writable: true, value}) : obj[key] = value;
var __assign = (a, b) => {
  for (var prop in b || (b = {}))
    if (__hasOwnProp.call(b, prop))
      __defNormalProp(a, prop, b[prop]);
  if (__getOwnPropSymbols)
    for (var prop of __getOwnPropSymbols(b)) {
      if (__propIsEnum.call(b, prop))
        __defNormalProp(a, prop, b[prop]);
    }
  return a;
};
var __markAsModule = (target) => __defProp(target, "__esModule", {value: true});
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, {get: all[name], enumerable: true});
};
var __exportStar = (target, module2, desc) => {
  if (module2 && typeof module2 === "object" || typeof module2 === "function") {
    for (let key of __getOwnPropNames(module2))
      if (!__hasOwnProp.call(target, key) && key !== "default")
        __defProp(target, key, {get: () => module2[key], enumerable: !(desc = __getOwnPropDesc(module2, key)) || desc.enumerable});
  }
  return target;
};
var __toModule = (module2) => {
  return __exportStar(__markAsModule(__defProp(module2 != null ? __create(__getProtoOf(module2)) : {}, "default", module2 && module2.__esModule && "default" in module2 ? {get: () => module2.default, enumerable: true} : {value: module2, enumerable: true})), module2);
};
__markAsModule(exports);
__export(exports, {
  ensureInstanceObjects: () => ensureInstanceObjects,
  fixAdapterObjects: () => fixAdapterObjects
});
var import_objects = __toModule(require("alcalzone-shared/objects"));
var import_io_package = __toModule(require("../../io-package.json"));
var import_global = __toModule(require("./global"));
const instanceObjects = import_io_package.instanceObjects;
async function fixAdapterObjects() {
  const stateObjs = (0, import_objects.values)(await import_global.Global.$$(`${import_global.Global.adapter.namespace}.*`, "state"));
  await fixBrightnessRange(stateObjs);
  await fixAuthenticationObjects();
  await fixBrightnessRole(stateObjs);
}
async function fixBrightnessRange(stateObjs) {
  const predicate = /(G|VG|L)\-\d+\.(lightbulb\.)?brightness$/;
  const fixableObjs = stateObjs.filter((o) => predicate.test(o._id));
  for (const obj of fixableObjs) {
    const oldCommon = JSON.stringify(obj.common);
    const newCommon = JSON.stringify(__assign(__assign({
      name: "Brightness"
    }, obj.common), {
      min: 0,
      max: 100,
      unit: "%"
    }));
    if (oldCommon !== newCommon) {
      obj.common = JSON.parse(newCommon);
      await import_global.Global.adapter.setForeignObjectAsync(obj._id, obj);
    }
  }
}
async function fixAuthenticationObjects() {
  const identityObj = await import_global.Global.adapter.getObjectAsync("info.identity");
  if (identityObj != null) {
    await import_global.Global.adapter.delState("info.identity");
    await import_global.Global.adapter.delObject("info.identity");
  }
}
async function fixBrightnessRole(stateObjs) {
  const predicate = /(G|VG|L)\-\d+\.(lightbulb\.)?brightness$/;
  const fixableObjs = stateObjs.filter((o) => predicate.test(o._id));
  for (const obj of fixableObjs) {
    const oldCommon = JSON.stringify(obj.common);
    const newCommon = JSON.stringify(__assign(__assign({}, obj.common), {
      role: "level.dimmer"
    }));
    if (oldCommon !== newCommon) {
      obj.common = JSON.parse(newCommon);
      await import_global.Global.adapter.setForeignObjectAsync(obj._id, obj);
    }
  }
}
async function ensureInstanceObjects() {
  if (instanceObjects == null || instanceObjects.length === 0)
    return;
  const setObjects = instanceObjects.map((obj) => import_global.Global.adapter.setObjectNotExistsAsync(obj._id, obj));
  await Promise.all(setObjects);
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  ensureInstanceObjects,
  fixAdapterObjects
});
//# sourceMappingURL=fix-objects.js.map
