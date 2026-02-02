/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import * as vscode from 'vscode';

function getOpenUris() {
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

export function onTabOpenNewTextDocument(listener: (document: vscode.TextDocument) => void) {
	return (e: vscode.TabChangeEvent) => {
		if (e.opened.length === 0) {
			return;
		}

		const openUris = getOpenUris();

		for (const tab of e.opened) {
			if (!(tab.input instanceof vscode.TabInputText)) {
				continue;
			}

			const uriStr = tab.input.uri.toString();

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

export function onAllTabsCloseTextUri(listener: (uri: vscode.Uri) => void) {
	// TODO - filter to process only those uris which are held by tsserver
	return (e: vscode.TabChangeEvent) => {
		if (e.closed.length === 0) {
			return;
		}

		const openUris = getOpenUris();

		for (const tab of e.closed) {
			if (!(tab.input instanceof vscode.TabInputText)) {
				continue;
			}

			const uriStr = tab.input.uri.toString();

			if (!openUris.includes(uriStr)) {
				listener(tab.input.uri);
			}
		}
	};
}
