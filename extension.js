const vscode = require('vscode');
const exec = require('child_process').execSync;
const fs = require('fs');

/**
 * @param {vscode.ExtensionContext} context
 */
function activate(context) {
	let disposable = vscode.commands.registerCommand('extension.openfile', (file) => {
		let type = exec(`xdg-mime query filetype "${file.path}"`).toString().trim();
		if (!type)
			return vscode.window.showErrorMessage(`Could not determine filetype.`);
		let app = exec(`xdg-mime query default "${type}"`).toString().trim();
		if (!app)
			return vscode.window.showErrorMessage(`Could not determine default app.`);
		try {
			exec(`xdg-open "${file.path}"`);
			vscode.window.showInformationMessage(`Opening in ${getAppName(app)}.`);
		} catch (e) {
			return vscode.window.showErrorMessage(`Could not open file: ${e.message.trim()}.`);
		}
	});

	context.subscriptions.push(disposable);
}
exports.activate = activate;

function getAppName(desktop) {
	let possibilities = [`/usr/share/applications/${desktop}`, `${process.env.HOME}/.local/share/applications/${desktop}`];
	for (let file of possibilities) {
		if (fs.existsSync(file)) {
			let entry = fs.readFileSync(file, 'utf8');
			let match = entry.match(/Name=(.+)/);
			if (match !== null) {
				return match[1];
			}
		}
	}
	return desktop.replace('.desktop', '');
}

function deactivate() { }

module.exports = {
	activate,
	deactivate
}
