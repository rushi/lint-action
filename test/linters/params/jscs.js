const JSCS = require("../../../src/linters/jscs");

const testName = "jscs";
const linter = JSCS;
const commandPrefix = "";
const extensions = ["js"];

// Linting without auto-fixing
function getLintParams(dir) {
	const stdoutFile1 = JSON.stringify({
		"./file1.js": [
			{ line: 2, column: 5, message: "Expected indentation of 4 characters" },
			{ line: 3, column: 5, message: "Expected indentation of 4 characters" },
			{ line: 3, column: 17, message: "Missing semicolon after statement" },
		],
		"./file2.js": [{ line: 3, column: 5, message: "If statement without curly braces" }],
	});

	return {
		// Expected output of the linting function
		cmdOutput: {
			status: 2,
			stdoutParts: [stdoutFile1],
			stdout: `[${stdoutFile1}]`,
		},
		// Expected output of the parsing function
		lintResult: {
			isSuccess: false,
			error: [
				{
					firstLine: 2,
					lastLine: 2,
					message: "Expected indentation of 4 characters",
					path: "./file1.js",
				},
				{
					firstLine: 3,
					lastLine: 3,
					message: "Expected indentation of 4 characters",
					path: "./file1.js",
				},
				{
					firstLine: 3,
					lastLine: 3,
					message: "Missing semicolon after statement",
					path: "./file1.js",
				},
				{
					firstLine: 3,
					lastLine: 3,
					message: "If statement without curly braces",
					path: "./file2.js",
				},
			],
			warning: [],
		},
	};
}

// Linting wit auto-fixing
function getAutoFixParams(dir) {
	const stdoutFile1 = JSON.stringify({
		"./file1.js": [],
		"./file2.js": [{ line: 3, column: 5, message: "If statement without curly braces" }],
	});

	return {
		// Expected output of the linting function
		cmdOutput: {
			status: 2,
			stdoutParts: [stdoutFile1],
			stdout: `[${stdoutFile1}]`,
		},
		// Expected output of the parsing function
		lintResult: {
			isSuccess: false,
			error: [
				{
					path: "./file2.js",
					firstLine: 3,
					lastLine: 3,
					message: "If statement without curly braces",
				},
			],
			warning: [],
		},
	};
}

module.exports = [testName, linter, commandPrefix, extensions, getLintParams, getAutoFixParams];
