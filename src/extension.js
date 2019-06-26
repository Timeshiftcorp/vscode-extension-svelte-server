// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
const vscode = require('vscode');
const express = require('express');
const path = require('path');
const { createServer } = require('http');
const opener = require("opener");
const r = require('vscode-uri')
let once = false;
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



	// app.use(express.static(path.join(vscode.workspace.rootPath, '/src')));
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
		opener('http://localhost:8099')
	});
	var ws = new WebSocket("ws://localhost:8099");

	let css
	vscode.workspace.findFiles("**/*.css", 10).then(c => {
		c.map(it => {
			vscode.workspace.openTextDocument(it).then(doc => {
				css += doc.getText()
			})
		})
		let z = css;
	})
	let svelteComponents = [];
	vscode.workspace.findFiles("**/*.svelte", 10).then(c => {
		c.map(it => {
			vscode.workspace.openTextDocument(it).then(doc => {

				if (doc.fileName.toLowerCase().indexOf('app.svelte') != -1) {
					var name = 'App'

				} else {

					var name = doc.fileName.substring(doc.fileName.indexOf('src'), doc.fileName.length).replace('.svelte', '').split("\\").join("/");
					let component = { component: { name: name, type: "svelte", source: doc.getText() }, text: doc.getText() };

					svelteComponents.push(component)
				}


			})
		})
		let z = css;
	})



	// The command has been defined in the package.json file
	// Now provide the implementation of the command with  registerCommand
	// The commandId parameter must match the command field in package.json
	// const doc = vscode.workspace.openTextDocument('app.svelte')
	let is_send = false;
	let text = ""
	// let once = false;
	// ws.on('open', function open() {
	// 	if (!once) {
	// 		let cssOnce = false;
	// 		svelteComponents.map(cmp => {
	// 			if (css && !cssOnce) {
	// 				cmp.css = css
	// 				cssOnce = true;
	// 			}
	// 			ws.send(JSON.stringify(cmp));
	// 		})
	// 		once = false
	// 	}
	// })

	vscode.workspace.onDidChangeTextDocument((e) => {

		// if (e.document === vscode.window.activeTextEditor.document && vscode.window.activeTextEditor.document.fileName.toLowerCase().indexOf('app.svelte') != -1 && !is_send) {
		if (e.document === vscode.window.activeTextEditor.document) {
			var ws = new WebSocket("ws://localhost:8099");
			is_send = true;


			ws.on('open', function open() {
				if (!once && svelteComponents.length > 0) {
					let cssOnce = false;
					svelteComponents.map(cmp => {
						if (css && !cssOnce) {
							cmp.css = css
							cssOnce = true;
						}
						ws.send(JSON.stringify(cmp));
					})
					once = true
				}


				let txt = e.document.getText();
				if (e.document.fileName.toLowerCase().indexOf('app.svelte') != -1) {
					var name = 'App'
				} else {

					var name = e.document.fileName.substring(e.document.fileName.indexOf('src'), e.document.fileName.length).replace('.svelte', '').split("\\").join("/");
				}

				let component = { component: { name: name, type: "svelte", source: "" }, text: txt };

				if (txt.toUpperCase() !== text.toUpperCase()) {
					ws.send(JSON.stringify(component));
					text = txt;
				}

				is_send = false
			});
		}
	});

	let disposable = vscode.commands.registerCommand('extension.svelte-server', function () {
		if (e.document === vscode.window.activeTextEditor.document && vscode.window.activeTextEditor.document.fileName.toLowerCase().indexOf('app.svelte') != -1 && !is_send) {

		}
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
