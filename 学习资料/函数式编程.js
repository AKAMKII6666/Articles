//参考资料
//https://www.bilibili.com/video/BV1TX4y1y7Lq?p=2&vd_source=d54a9019cfd533224c65212f0eaf5180

/* 
--------------------------------------------------------------------------------------------------------------------------------
1.高阶函数
高阶函数就是可以将一个函数当做参数进行传递，传递到另一个函数内部去使用
*/

Array.prototype.reduce = function (_callback, initialValue) {
	let result = [];
	let startIndex = 0;
	if (typeof initialValue !== "undefined") {
		result = initialValue;
		startIndex = 1;
	} else {
		result = this[0];
	}
	for (let i = startIndex; i < result.length; i++) {
		result = _callback(result, this[i], i, this);
	}
	return result;
};

/* 
--------------------------------------------------------------------------------------------------------------------------------
2.高阶函数，函数可以作为返回值
*/

const abc = function (b) {
	let a = 10;
	return function () {
		return a + b;
	};
};

/* 
--------------------------------------------------------------------------------------------------------------------------------
3.纯函数
纯函数是指在函数内部只操作函数中传入的参数，并使用return输出结果
不作任何有副作用的操作，例如依赖了某个全局变量，状态，或者操作了某个全局变量或者状态
它只做纯粹的计算
*/

const abc2 = function (a, b) {
	return a + b;
};

/* 
--------------------------------------------------------------------------------------------------------------------------------
4.柯里化
柯里化允许你使用函数作为参数，并返回一个新的函数
新的函数补全运行参数就可以运行，没补全就继续返回一个新的函数
反正我的理解就是一个函数工厂
*/

const curry = function (_func) {
	let reCall = function (...args) {
		if (args.length < _func.length) {
			return function () {
				let _args = args.concat(Array.from(arguments));
				return reCall.apply(this, _args);
			};
		}
		return _func(...args);
	};

	return reCall;
};

//使用方式:

//比如现在有个纯函数
const pureFunc = function (a, b, c) {
	return a + b + c;
};

let cPC = curry(pureFunc);
cPC = cPC(3, 3);
let result = cPC(3);
console.log(result); //9

/* 
--------------------------------------------------------------------------------------------------------------------------------
5函数组合
一种把函数进行组合在运行的方式，可以把多个函数组合成一个新的函数
可以让函数最大程度地重用，可以以管道的形式做一个数据处理流水线
避免洋葱代码
注意要从右到左进行调用
*/

/* const funcA = function (_arr) {
	return _arr.reverse();
};

const funcB = function (_arr) {
	return _arr.map(function (item) {
		return item + 1;
	});
};

const funcC = function (_arr) {
	return _arr[0];
}; */

const funcA = (_arr) => _arr.reverse();

const funcB = (_arr) => _arr.map((item) => item + 1);

const funcC = (_arr) => _arr[0];

/* const compose = function (...args) {
	return function (inputargs) {
		return args.reduceRight(function (acc, currFn) {
			acc = currFn(acc);
			return acc;
		}, inputargs);
	};
}; */

const compose =
	(...args) =>
	(inputArgs) =>
		args.reduceRight((acc, currFn) => currFn(acc), inputArgs);

let testFunc = compose(funcC, funcB, funcA);

let result2 = testFunc([1, 2, 3, 4, 5, 6, 7, 8, 9]);
console.log(result2);
