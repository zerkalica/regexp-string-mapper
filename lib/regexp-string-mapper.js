var Traverse = require('traverse');

function pathway(obj, path) {
	return typeof obj === 'object' ? Traverse(obj).get(typeof path === 'string' ? path.split('.') : path) : undefined;
}

function buildDefaultRegex(separator) {
	return RegExp(separator + '(?:([\\w\\d.]+)(?:[: ]+(.+?))?)' + separator + '([\\s])?', 'g');
}

function createDefaultFormatter(serialize) {
	serialize = serialize || function (val) {
		return JSON.stringify(val);
	};

	return {
		detect: function (value) {
			return Array.isArray(value) || typeof value === 'object';
		},
		format: function (value, arg) {
			return serialize(value);
		}
	};
}

function createMomentFormatter(moment) {
	moment = moment || function (val) {
		return {
			format: function (arg) {
				return val.toString();
			}
		};
	};

	return {
		detect: function (value) {
			return value instanceof Date;
		},
		format: function (value, arg) {
			return moment(value).format(arg);
		}
	};
}

/**
 * RegExp string mapper
 *
 * @param {Object} options Options
 * @param {[String]} options.separator Token match separator, default - %
 * @param {[Formatter[]]} options.formatters Array of formatters
 */
function RegExpStringMapper(options) {
	if (!(this instanceof RegExpStringMapper)) {
		return new RegExpStringMapper(options);
	}
	options = options || {};
	this._formatters = [];
	this.addFormatter(createDefaultFormatter(options.serialize));
	this.addFormatter(createMomentFormatter(options.moment));
	this._separator  = options.separator || '%';
	this._regex      = buildDefaultRegex(this._separator);
	this._magic      = '@RegExpStringMapper';
	this._separatorRegExp = RegExp(this._separator + this._separator, 'g');
	this._magicRegExp = RegExp(this._magic, 'g');
}

RegExpStringMapper.prototype.addFormatter = function addFormatter(formatter) {
	this._formatters = [formatter].concat(this._formatters);

	return this;
};

/**
 * Replace string tokens to values from token map
 *
 * @param  {String} message Message with tokens
 * @param  {Object} map     Tokens hash map
 *
 * @return {String} String with tokens
 */
RegExpStringMapper.prototype.map = function map(message, values) {
	if (values === null || typeof values !== 'object' || Array.isArray(values)) {
		throw TypeError('values is not an object');
	}
	if (typeof message !== 'string') {
		throw TypeError('message is not a string');
	}
	var formatters = this._formatters;

	return message
		.replace(this._separatorRegExp, this._magic)
		.replace(this._regex, function RegExpStringMapper_map_replace(val, token, parserArg, spaces) {
			var value =  token ? pathway(values, token) : null;

			for (var i = 0, j = formatters.length; i < j; i++) {
				var formatter = formatters[i];
				if(formatter.detect(value)) {
					value = formatter.format(value, parserArg);
					break;
				}
			}
			return value ? (value + (spaces || '')) : '';
		})
		.replace(this._magicRegExp, this._separator);
};

module.exports = RegExpStringMapper;
