import { commands, workspace } from "vscode";
import { ProviderResult, Range, TextEdit, TextEditor, TextEditorEdit } from "vscode";

import * as constants from "../../constants";

import { XmlFormatterFactory } from "../xml-formatter";
import { XmlFormattingEditProvider } from "../xml-formatting-edit-provider";
import { XmlFormattingOptionsFactory } from "../xml-formatting-options";

export const FormatAsXmlCommandName = "formatAsXml";

export function formatAsXml(editor: TextEditor, edit: TextEditorEdit): void {
    const xmlFormattingEditProvider = new XmlFormattingEditProvider(workspace.getConfiguration(constants.extensionPrefix), XmlFormatterFactory.getXmlFormatter());
    const formattingOptions = {
        insertSpaces: <boolean>editor.options.insertSpaces,
        tabSize: <number>editor.options.tabSize
    };

    let edits: ProviderResult<TextEdit[]>;

    if (!editor.selection.isEmpty) {
        edits = xmlFormattingEditProvider.provideDocumentRangeFormattingEdits(
            editor.document,
            new Range(editor.selection.start, editor.selection.end),
            formattingOptions,
            null);
    }

    else {
        edits = xmlFormattingEditProvider.provideDocumentFormattingEdits(
            editor.document,
            formattingOptions,
            null);
    }

    for (let i = 0; i < (edits as TextEdit[]).length; i++) {
        const textEdit = (edits as TextEdit[])[i];

        editor.edit(async (editBuilder) => {
            editBuilder.replace(textEdit.range, textEdit.newText);

            // wiggle the cursor to deselect the formatted XML (is there a non-hacky way to go about this?)
            await commands.executeCommand("cursorMove", {
                to: "left",
                by: "character"
            });
            await commands.executeCommand("cursorMove", {
                to: "right",
                by: "character"
            });
        });
    }
}
