// 基础类型检查
const strictEqual = ( a, b ) => a === b;
const isType = (ele, type) => Object.prototype.toString.call(ele) === '[object ' +  type + ']';
const isString = ele => isType(ele,'String') ;
const isArray = ele => isType(ele, 'Array' );
const isNumber = ele => isType(ele, 'Number');
const isFunction = ele => isType(ele, 'Function');

exports.isType;
exports.isString;
exports.isArray;
exports.isNumber;
exports.isFunction;


