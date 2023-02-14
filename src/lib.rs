use std::io::Cursor;
use wasm_bindgen::prelude::*;
use brainfuck_exe::{Brainfuck, ExecutionInfo};

#[cfg(feature = "wee_alloc")]
#[global_allocator]
static ALLOC: wee_alloc::WeeAlloc = wee_alloc::WeeAlloc::INIT;

/// output struct returned by the `execute` function
/// providing relevant information for the execution result
#[wasm_bindgen]
#[derive(Debug, Clone)]
pub struct Output {
    output: String,
    cells: Vec<u32>,
    mem_size: usize,
    pointer: usize,
    code_len: usize,
    instructions: usize,
}

#[wasm_bindgen]
#[allow(clippy::missing_const_for_fn)]
impl Output {
    #[must_use]
    #[wasm_bindgen(getter)]
    pub fn output(&self) -> String {
        self.output.clone()
    }

    #[must_use]
    #[wasm_bindgen(getter)]
    pub fn instructions(&self) -> usize {
        self.instructions
    }

    #[must_use]
    #[wasm_bindgen(getter)]
    pub fn cells(&self) -> Vec<u32> {
        self.cells.clone()
    }

    #[must_use]
    #[wasm_bindgen(getter)]
    pub fn mem_size(&self) -> usize {
        self.mem_size
    }

    #[must_use]
    #[wasm_bindgen(getter)]
    pub fn code_len(&self) -> usize {
        self.code_len
    }

    #[must_use]
    #[wasm_bindgen(getter)]
    pub fn pointer(&self) -> usize {
        self.pointer
    }
}

/// binding function to execute the brainfuck code provided with applicable options
///
/// # Errors
/// All errors are propogated from the execution within `Brainfuck`
/// and if decoding the output bytes (UTF-8) fails
#[wasm_bindgen]
pub fn execute(
    code: &str,
    input: Option<String>,
    max_cell_value: Option<u32>,
    memory_size: Option<usize>,
    instructions_limit: Option<usize>,
) -> Result<Output, JsError> {
    let buffer: Vec<u8> = Vec::new();
    let mut output = Cursor::new(buffer);
    let mut interp = Brainfuck::new(code)
        .with_output_ref(&mut output)
        .with_bench_execution(false)
        .with_flush(false);

    if let Some(input) = input {
        interp = interp.with_input(
            Cursor::new(input.into_bytes())
        );
    }

    if let Some(val) = max_cell_value {
        interp = interp.with_max_value(val);
    }

    if let Some(mem) = memory_size {
        interp = interp.with_mem_size(mem);
    }

    if let Some(limit) = instructions_limit {
        interp = interp.with_instructions_limit(limit);
    }

    let ExecutionInfo {
        cells, mem_size, pointer, code_len, ..
    } = interp.execute()
        .map_err(|err|
            JsError::new(format!("{err}").as_str())
        )?;
    let instructions = interp.instructions_count();

    let output = String::from_utf8(output.into_inner())
        .map_err(|err|
            JsError::new(format!("Something went wrong when decoding the output:\n{err}").as_str())
        )?;

    Ok(Output {
        output,
        cells,
        mem_size,
        pointer,
        code_len,
        instructions,
    })
}