use std::io::Cursor;
use wasm_bindgen::prelude::*;
use brainfuck_exe::Brainfuck;

#[must_use]
#[wasm_bindgen]
pub fn execute(code: &str, input: Option<String>) -> Result<JsValue, JsError> {
    let buffer: Vec<u8> = Vec::new();
    let mut output = Cursor::new(buffer);
    let mut interp = Brainfuck::new(code)
        .with_output_ref(&mut output);

    if let Some(input) = input {
        interp = interp.with_input(
            Cursor::new(input.as_bytes().to_vec())
        );
    }

    interp.execute()
        .map_err(|err|
            JsError::new(format!("{err}").as_str())
        )?;

    Ok(String::from_utf8(output.get_ref().clone())
        .map_err(|err|
            JsError::new(format!("Something went wrong when decoding the output:\n{err}").as_str())
        )?
        .into()
    )
}