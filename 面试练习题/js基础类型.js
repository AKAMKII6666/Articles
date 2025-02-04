//reduce
Array.reduce = function (_callback, _initialValue) {
	if (this.length === 0) {
		return;
	}
	let result = [];
	let startIndex = 0;
	if (typeof _initialValue !== "undefined") {
		result = _initialValue;
		startIndex = 1;
	} else {
		result = this[0];
	}
	for (let i = startIndex; i < this.length; i++) {
		result = _callback(result, this[i], i, this);
	}
	return result;
};

/* Array.prototype.reduce = function <T, U>(_callback: (acc: T, current: U, index: number, array: U[]) => T, initalValues?: T): T {
	let result: T;
	let startIndex: number = 0;
	if (typeof initalValues !== "undefined") {
		result = initalValues;
		startIndex = 1;
	} else if (this.length !== 0) {
		result = this[0];
	} else {
		throw new Error("Empty Array!");
	}
	for (let i = 0; i < this.length; i++) {
		result = _callback(result, this[i], i, this);
	}
	return result;
}; */

//Promise.all;
export const promiseAll = function (_arr) {
	//定义返回对象
	let result = {
		//总个数
		count: _arr.length,
		//请求返回值
		results: [],
		//then的callback所保存的地方
		thenCallbacks: [],
		//每个单位完成后执行的计数方法
		complete: (_data, index) => {
			this.count++;
			result.results[index] = _data;
			if (this.count === _arr.length) {
				finish();
			}
		},
		//所有单位完成后运行的方法
		finish: () => {
			let result = this.thenCallbacks(this.results[0]);
			for (let i = 1; i < this.thenCallbacks.length; i++) {
				result = this.thenCallbacks(result);
			}
		},
		//定义catch
		catch: (callback) => {
			this.catchFunc = callback;
		},
		//catch方法本体
		catchFunc: (_err) => {},
		//链式调用then
		then: (_callBack) => {
			thenCallbacks.push(_callBack);
			return this;
		},
	};

	//循环给promise.all传进来的promise加then
	for (var i = 0; i < _arr.length; i++) {
		_arr.then(
			function (_data) {
				try {
					result.complete(_data, i);
				} catch (_e) {
					result.catchFunc(_e);
				}
			},
			function (_data) {
				try {
					result.complete(_data, i);
				} catch (_e) {
					result.catchFunc(_e);
				}
			}
		);
	}

	//返回promise.all结构体方便外面加then或catch
	return result;
};

//千分位分隔符
export const thousandsSplit = function (_str) {
	if (typeof _str === "undefined" || _str === null) {
		return _str;
	}

	if (typeof _str !== "string") {
		return _str;
	}

	return _str
		.split("")
		.reverse()
		.reduce(function (acc, item, index) {
			if (index % 3 === 0 && index !== 0) {
				acc = "," + acc;
			}
			acc = item + acc;
			return acc;
		}, _str.split("").reverse()[0]);
};
