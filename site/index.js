import init, { execute } from './pkg/brainfuck_web.js';

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

function handler(editor, event) {
    event.preventDefault();
    
    const code = editor.getValue();
    let result = execute(code);

    const outputEl = document.getElementById("output-content");
    if (outputEl) {
        outputEl.innerHTML = result;
    }
}

async function main() {
    await init();
    let editor = setupEditor();

    const form = document.getElementById("input");
    if (form) {
        form.addEventListener('submit', (event) => {
            handler(editor, event);
        });
    }
}

await main();