import init, { execute } from "./pkg/brainfuck_web.js";

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

function parseVal(elem) {
    const val = elem?.value;
    return [null, ""].includes(val)
        ? null
        : Number(val);
}

function handler(editor, event) {
    event.preventDefault();

    const code = editor.getValue();
    const [input, maxCellValue, memorySize, instLimit] = [
        document.getElementById("input-stream")?.value,
        parseVal(document.getElementById("max-cell-val")),
        parseVal(document.getElementById("mem-size")),
        parseVal(document.getElementById("inst-lim")),
    ];

    let result;
    let output;
    let instructions;
    try {
        result = execute(
            code, input, maxCellValue, memorySize, instLimit,
        );
        [output, instructions] = [result.output, result.instructions];
    } catch (err) {
        [output, instructions] = [String(err), instLimit];
    }

    const outputEl = document.getElementById("output-content");
    if (outputEl) {
        outputEl.innerHTML = output;
    }

    const instCounter = document.getElementById("instructions-val");
    if (instCounter) {
        instCounter.innerHTML = instructions;
    }

    const modalBody = document.getElementById("modal-body");
    if (modalBody) {
        modalBody.innerHTML = `
            <div id="cells">
                <div>Cells</div>
                <pre><code>[${result.cells.join(', ')}]</code></pre>
            </div>
            <span>Pointer:&nbsp;&nbsp;<code>${result.pointer}</code></span>
            <span>Code-length:&nbsp;&nbsp;<code>${result.code_len}</code></span>
            `;
    }
}

function enableTooltips() {
    const tooltipTriggerList = [].slice.call(
        document.querySelectorAll('[data-bs-toggle="tooltip"]')
    );
    tooltipTriggerList.map(
        (tooltipTriggerEl) => {
            return new bootstrap.Tooltip(tooltipTriggerEl);
        }
    );

    const details = document.getElementById("view-cells");
    if (details) {
        new bootstrap.Tooltip(details);
    }
}

async function main() {
    await init();
    enableTooltips();
    let editor = setupEditor();

    const form = document.getElementById("input");
    if (form) {
        form.addEventListener("submit", (event) => {
            handler(editor, event);
        });
    }
}

await main();