const { FunctionErrors: Error } = require('@cedalo/error-codes');


class Runner {
	constructor(sheet, args) {
		this.sheet = sheet;
		// work on copy or not???
		this.args = args ? args.slice(0) : [];
		this.isEnabled = true;
		this.defReturnValue = true;
		this.mappedArgs = [];
//		this.funcArgs = {};
		this.error = Error.ifNot(sheet, Error.code.ARGS);
	}

	onSheetCalculation() {
		this.isEnabled = !this.error ? this.sheet.isProcessing : false;
		return this;
	}

	withArgCount(nr) {
		this.error = this.error || Error.ifTrue(this.args.length !== nr, Error.code.ARGS);
		return this;
	}

	withMinArgs(min) {
		this.error = this.error || Error.ifTrue(this.args.length < min, Error.code.ARGS);
		return this;
	}

	withMaxArgs(max) {
		this.error = this.error || Error.ifTrue(this.args.length > max, Error.code.ARGS);
		return this;
	}

	// adds additional value which is passed to run(), eg: addMappedArg(() => sheet.streamsheet || Error.code.NO_STREAMSHEET)
	addMappedArg(fn) {
		if (!this.error) {
			const res = fn(...this.mappedArgs);
			this.error = Error.isError(res);
			this.mappedArgs.push(res);
		}
		return this;
	}
	// addMappedArg2(name, fn) {
	// 	if (!this.error) {
	// 		const res = fn(this.funcArgs);
	// 		this.error = Error.isError(res);
	// 		this.funcArgs[name] = res;
	// 	}
	// 	return this;
	// }

	mapNextArg(fn) {
		if (!this.error) {
			const term = this.args.shift();
			const res = fn(term, ...this.mappedArgs);
			this.error = Error.isError(res);
			this.mappedArgs.push(res);
		}
		return this;
	}
	// mapNextArg2(name, fn) {
	// 	if (!this.error) {
	// 		const term = this.args.shift();
	// 		const res = fn(term, this.funcArgs);
	// 		this.error = Error.isError(res);
	// 		this.funcArgs[name] = res;
	// 	}
	// 	return this;
	// }

	reduce(fn) {
		if (!this.error) {
			const res = fn(...this.mappedArgs);
			this.error = Error.isError(res);
			this.mappedArgs = res;
		}
		return this;
	}
	// reduce2(name, fn) {
	// 	if (!this.error) {
	// 		const res = fn(this.funcArgs);
	// 		this.error = Error.isError(res);
	// 		this.funcArgs[name] = res;
	// 	}
	// 	return this;
	// }

	validate(fn) {
		if (!this.error) {
			this.error = Error.isError(fn(...this.mappedArgs));
		}
		return this;
	}
	// validate2(fn) {
	// 	if (!this.error) {
	// 		this.error = Error.isError(fn(this.funcArgs));
	// 	}
	// 	return this;
	// }

	// tmp. => review and maybe combine with onSheetCalculation
	defaultReturnValue(fn) {
		this.defReturnValue = fn(...this.mappedArgs);
		this.defReturnValue = this.defReturnValue != null ? this.defReturnValue : true;
		return this;
	}
	// defaultReturnValue2(fn) {
	// 	this.defReturnValue = fn(this.funcArgs);
	// 	this.defReturnValue = this.defReturnValue != null ? this.defReturnValue : true;
	// 	return this;
	// }

	run(fn) {
		return this.error || (this.isEnabled ? fn(...this.mappedArgs) : this.defReturnValue);
	}
	// run2(fn) {
	// 	return this.error || (this.isEnabled ? fn(this.funcArgs) : this.defReturnValue);
	// }
}


module.exports = (sheet, terms) => new Runner(sheet, terms);