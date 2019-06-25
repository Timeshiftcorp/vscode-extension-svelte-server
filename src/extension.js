// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
const vscode = require('vscode');
const express = require('express');
const path = require('path');
const { createServer } = require('http');
// this method is called when your extension is activated
// your extension is activated the very first time the command is executed

/**
 * @param {vscode.ExtensionContext} context
 */
function activate(context) {

	// Use the console to output diagnostic information (console.log) and errors (console.error)
	// This line of code will only be executed once when your extension is activated
	console.log('Congratulations, your extension "svelte-repl" is now active!');
	const WebSocket = require('ws');
	const app = express();
	app.use(express.static(vscode.workspace.rootPath));
	app.use(express.static(path.join(context.extensionPath, '/repl')));
	const server = createServer(app);
	const wss = new WebSocket.Server({ server });
	wss.on('connection', function connection(ws) {
		ws.on('message', function incoming(data) {
			wss.clients.forEach(function each(client) {
				if (client.readyState === WebSocket.OPEN) {
					client.send(data);
				}
			});
		});
	});
	server.listen(8099, function () {
		console.log('Listening on http://localhost:8099');
	});

	// The command has been defined in the package.json file
	// Now provide the implementation of the command with  registerCommand
	// The commandId parameter must match the command field in package.json
	vscode.workspace.onDidChangeTextDocument((e) => {
		if (e.document === vscode.window.activeTextEditor.document) {

			var ws = new WebSocket("ws://localhost:8099");
			ws.on('open', function open() {
				let txt = e.document.getText();
				ws.send(txt);
			});
		}
	});

	let disposable = vscode.commands.registerCommand('extension.svelte-server', function () {
		// The code you place here will be executed every time your command is executed

		// Display a message box to the user
		vscode.window.showInformationMessage('server is run http://localhost:8099');
	});

	context.subscriptions.push(disposable);
}
exports.activate = activate;

// this method is called when your extension is deactivated
function deactivate() { }

module.exports = {
	activate,
	deactivate
}
