/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import * as vscode from 'vscode';

function getOpenTextDocumentsUrisList() {
	const uris: string[] = [];
	for (const group of vscode.window.tabGroups.all) {
		for (const tab of group.tabs) {
			if (!(tab.input instanceof vscode.TabInputText)) {
				continue;
			}
			uris.push(tab.input.uri.toString());
		}
	}
	return uris;
}

// Filters tab open events to the first time document open
export function onTabsOpenTextDocument(listener: (document: vscode.TextDocument) => void) {
	return (e: vscode.TabChangeEvent) => {
		if (e.opened.length === 0) {
			return;
		}

		const openUris = getOpenTextDocumentsUrisList();

		for (const tab of e.opened) {
			if (!(tab.input instanceof vscode.TabInputText)) {
				continue;
			}

			const uriStr = tab.input.uri.toString();

			// If there is only one match in opened uris list, call listener
			// Since it means that document is opened for the first time
			if (openUris.filter(u => u === uriStr).length === 1) {
				vscode.workspace.openTextDocument(tab.input.uri).then(
					document => {
						listener(document);
					}
				);
			}
		}
	};
}

// Filters tab close events to the last closed tab for the document
export function onTabsCloseTextDocument(listener: (uri: vscode.Uri) => void) {
	return (e: vscode.TabChangeEvent) => {
		if (e.closed.length === 0) {
			return;
		}

		const openUris = getOpenTextDocumentsUrisList();

		for (const tab of e.closed) {
			if (!(tab.input instanceof vscode.TabInputText)) {
				continue;
			}

			const uriStr = tab.input.uri.toString();

			// If there is no matches in opened uris list, call listener
			// Since it means that there are no more tabs of this document
			if (!openUris.includes(uriStr)) {
				listener(tab.input.uri);
			}
		}
	};
}
