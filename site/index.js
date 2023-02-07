import init, { execute } from './pkg/interpreter.js';

function setupEditor() {
    let editor = ace.edit("editor");
    editor.setTheme("ace/theme/dracula");
    editor.setShowPrintMargin(false);
    editor.renderer.setScrollMargin(30);
    editor.session.setOptions({
        tabSize: 4,
        useSoftTabs: true,
    });

    editor.setBehavioursEnabled(true);
    editor.container.style.lineHeight = 2;
    editor.renderer.updateFontSize();
    return editor;
}

async function main() {
    await init();
    setupEditor();
}

await main();