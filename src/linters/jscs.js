const { run } = require("../utils/action");
const commandExists = require("../utils/command-exists");
const { initLintResult } = require("../utils/lint-result");
const { getNpmBinCommand } = require("../utils/npm/get-npm-bin-command");
const { removeTrailingPeriod } = require("../utils/string");

class JSCS {
	static get name() {
		return "JSCS";
	}

	/**
	 * Verifies that all required programs are installed. Throws an error if programs are missing
	 * @param {string} dir - Directory to run the linting program in
	 * @param {string} prefix - Prefix to the lint command
	 */
	static async verifySetup(dir, prefix = "") {
		// Verify that NPM is installed (required to execute ESLint)
		if (!(await commandExists("npm"))) {
			throw new Error("NPM is not installed");
		}

		// Verify that JSCS is installed
		const commandPrefix = prefix || getNpmBinCommand(dir);
		try {
			run(`${commandPrefix} jscs -v`, { dir });
		} catch (err) {
			throw new Error(`${this.name} is not installed`);
		}
	}

	/**
	 * Runs the linting program and returns the command output
	 * @param {string} dir - Directory to run the linter in
	 * @param {string[]} extensions - File extensions which should be linted
	 * @param {string} args - Additional arguments to pass to the linter
	 * @param {boolean} fix - Whether the linter should attempt to fix code style issues automatically
	 * @param {string} prefix - Prefix to the lint command
	 * @returns {{status: number, stdout: string, stderr: string}} - Output of the lint command
	 */
	static lint(dir, extensions, args = "", fix = false, prefix = "") {
		// const extensionsArg = extensions.map((ext) => `.${ext}`).join(",");
		const fixArg = fix ? "--fix" : "";
		const commandPrefix = prefix || getNpmBinCommand(dir);
		return run(`${commandPrefix} jscs ${fixArg} --reporter json ${args} "."`, {
			dir,
			ignoreErrors: true,
		});
	}

	/**
	 * Parses the output of the lint command. Determines the success of the lint process and the
	 * severity of the identified code style violations
	 * @param {string} dir - Directory in which the linter has been run
	 * @param {{status: number, stdout: string, stderr: string}} output - Output of the lint command
	 * @returns {import('../utils/lint-result').LintResult} - Parsed lint result
	 */
	static parseOutput(dir, output) {
		const lintResult = initLintResult();
		lintResult.isSuccess = output.status === 0;

		console.log("raw output is", output);

		let outputJson;
		try {
			outputJson = JSON.parse(output.stdout);
		} catch (err) {
			throw Error(
				`Error parsing ${this.name} JSON output: ${err.message}. Output: "${output.stdout}"`,
			);
		}

		console.log("For debugging outputJson is", typeof outputJson, outputJson);
		outputJson.forEach((jsCSoutput) => {
			Object.keys(jsCSoutput).forEach((file) => {
				const errors = jsCSoutput[file];
				if (errors.length > 0) {
					errors.forEach((error) => {
						lintResult.error.push({
							path: file,
							firstLine: error.line,
							lastLine: error.line,
							message: error.message,
						});
					});
				}
			});
		});;

		return lintResult;
	}
}

module.exports = JSCS;
