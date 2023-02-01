use std::io::Cursor;
use wasm_bindgen::prelude::*;
use brainfuck_exe::Brainfuck;


#[wasm_bindgen]
pub fn execute(
    code: &str,
    input: Option<String>,
    max_cell_value: Option<u32>,
    memory_size: Option<usize>,
    instructions_limit: Option<usize>,
) -> Result<JsValue, JsError> {
    let buffer: Vec<u8> = Vec::new();
    let mut output = Cursor::new(buffer);
    let mut interp = Brainfuck::new(code)
        .with_output_ref(&mut output);

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
        interp = interp.with_instructions_limit(limit)
    }

    interp.execute()
        .map_err(|err|
            JsError::new(format!("{err}").as_str())
        )?;

    let output = String::from_utf8(output.get_ref().clone())
        .map_err(|err|
            JsError::new(format!("Something went wrong when decoding the output:\n{err}").as_str())
        )?;

    Ok(output.into())
}