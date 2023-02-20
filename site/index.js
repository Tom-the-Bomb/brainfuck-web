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

    const copy = document.getElementById("copy-output");
    if (copy) {
        copy.disabled = false;
    }

    const code = editor.getValue();
    const [input, fallbackChar, maxCellValue, memorySize, instLimit] = [
        document.getElementById("input-stream")?.value,
        document.getElementById("fallback-input")?.value,
        parseVal(document.getElementById("max-cell-val")),
        parseVal(document.getElementById("mem-size")),
        parseVal(document.getElementById("inst-lim")),
    ];

    let start, end;
    let output, instructions, cells, pointer, code_len, mem_size, length;
    try {
        start = performance.now();
        let result = execute(
            code, input, maxCellValue, memorySize, fallbackChar, instLimit,
        );
        end = performance.now();

        [output, instructions, cells, pointer, code_len, mem_size, length] = [
            result.output,
            result.instructions,
            result.cells.join(", "),
            result.pointer,
            result.code_len,
            result.mem_size,
            result.output.length,
        ];
    } catch (err) {
        [start, end] = [0.0, 0.0];
        [output, instructions, cells, pointer, code_len, mem_size, length] = [
            String(err),
            instLimit || 0,
            "", 0, code.length, 0, 0,
        ];
    }

    if (copy) {
        copy.onclick = async () => {
            const original = copy.innerHTML;
            navigator.clipboard.writeText(output);

            copy.innerHTML =
                `<div id="copied-msg" class="text-success">Copied!</div>`;
            await new Promise(resolve => setTimeout(resolve, 1500));
            copy.innerHTML = original;
        }
    }

    const outputEl = document.getElementById("output-content");
    if (outputEl) {
        outputEl.innerHTML = output;
    }

    const instCounter = document.getElementById("instructions-val");
    if (instCounter) {
        instCounter.innerHTML = instructions;
    }

    const time = document.getElementById("time");
    if (time) {
        time.innerHTML = String((end - start).toFixed(1));
    }

    const modalBody = document.getElementById("modal-body");
    if (modalBody) {
        modalBody.innerHTML = `
            <div id="cells">
                <div>Cells</div>
                <pre><code>[${cells}]</code></pre>
            </div>
            <span>Pointer:&nbsp;&nbsp;<code>${pointer}</code></span>
            <span>Code-length:&nbsp;&nbsp;<code>${code_len}</code></span>
            <span>Output-length:&nbsp;&nbsp;<code>${length}</code></span>
            <span>Memory-size:&nbsp;&nbsp;<code>${mem_size}</code></span>`;
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