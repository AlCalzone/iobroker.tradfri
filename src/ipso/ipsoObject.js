"use strict";

import { entries } from "../lib/object-polyfill";
import _ from "../lib/global";

const
	parsers = Symbol("parsers"),
	deserialize = Symbol("deserialize"),
	parseValue = Symbol("parseValue"),
	getParser = Symbol("getParser"),
	keys = Symbol("keys"),
	propNames = Symbol("propNames"),
	defaultValues = Symbol("defaultValues"),
	defineProperties = Symbol("defineProperties")
	;

// common base class for all objects that are transmitted somehow
export default class IPSOObject {

	constructor(sourceObj, ...properties) {
		// define properties if neccessary
		if (_.isdef(properties))
			this[defineProperties](properties);

		// parse the contents of the source object
		if (_.isdef(sourceObj))
			this[deserialize](sourceObj);
	}

	[defineProperties](properties) {
		this[keys] = {}; // lookup dictionary for propName => key
		this[propNames] = {}; // lookup dictionary for key => propName
		this[defaultValues] = {}; // lookup dictionary for key => default property value
		this[parsers] = {}; // // lookup dictionary for key => property parser

		for (let index in properties) {
			let [key, name, ...options] = properties[index];
			// populate key lookup table
			this[keys][name] = key;
			this[propNames][key] = name;
			if (options && options.length) {
				// default value, set property
				this[defaultValues][key] = options[0];
				this[name] = options[0];
				// parser
				if (options.length >= 1)
					this[parsers][key] = options[1];
			}
		}
	}

	//// defines a parser function for partial objects
	//defineParser(key, fn) {
	//	if (!this[parsers].hasOwnProperty(key)) this[parsers][key] = fn;
	//}
	[getParser](key) {
		if (this[parsers].hasOwnProperty(key)) return this[parsers][key];
	}

	// parses an object
	[deserialize](obj) {
		for (let [key, value] of entries(obj)) {
			// which property are we parsing?
			const propName = this.getPropName(key);
			if (!propName) {
				_.log(`{{yellow}}found unknown property with key ${key}`);
				continue;
			}
			// try to find parser for this property
			const parser = this[getParser](key);
			// parse the value
			const parsedValue = this[parseValue](key, value, parser);
			// and remember it
			this[propName] = parsedValue;
		}
	}
	// parses a value, depending on the value type and defined parsers
	[parseValue](propKey, value, parser = null) {
		if (value instanceof Array) {
			// Array: parse every element
			return value.map(v => this[parseValue](propKey, v, parser));
		} else if (typeof value === "object") {
			// Object: try to parse this, objects should be parsed in any case
			if (parser) {
				return parser(value);
			} else {
				_.log(`{{yellow}}could not find property parser for key ${propKey}`);
			}
		} else if (parser) {
			// if this property needs a parser, parse the value
			return parser(value);
		} else {
			// otherwise just return the value
			return value;
		}
	}

	getKey(propName) { return this[keys][propName]; }
	getPropName(key) { return this[propNames][key]; }

	// serializes this object in order to transfer it via COAP
	serialize(reference = null) {
		const ret = {};

		const serializeValue = (key, propName, value, refValue) => {
			if (value instanceof IPSOObject) {
				// if the value is another IPSOObject, then serialize that
				value = value.serialize(refValue);
			} else {
				// if the value is not the default one, then remember it
				if (_.isdef(refValue)) {
					if (refValue === value) return null;
				} else {
					// there is no default value, just remember the actual value
				}
			}
			return value;
		};

		const refObj = reference || this[defaultValues];
		// check all set properties
		for (let propName of this[propNames]) {
			if (this.hasOwnProperty(propName)) {
				const key = this.getKey(propName);
				let value = this[propName];
				let refValue = null;
				if (_.isdef(refObj) && refObj.hasOwnProperty(propName))
					refValue = refObj[propName];

				if (value instanceof Array) {
					// serialize each item
					if (_.isdef(refValue)) {
						// reference value exists, make sure we have the same amount of items
						if (!(refValue instanceof Array && refValue.length === value.length)) {
							throw "cannot serialize arrays when the reference values don't match";
						}
						// serialize each item with the matching reference value
						value = value.map((v, i) => serializeValue(key, propName, v, refValue[i]));
					} else {
						// no reference value, makes things easier
						value = value.map(v => serializeValue(key, propName, v, null));
					}
					// now remove null items
					value = value.filter(v => _.isdef(v));
				} else {
					// directly serialize the value
					value = serializeValue(key, propName, value, refValue);
				}

				ret[key] = value;
			}
		}

		return ret;
	}

}