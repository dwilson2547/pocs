# Marker conversion

[Full README](https://github.com/datalab-to/marker/tree/master)

- Python 3.10+ required
- [Torch](https://pytorch.org/get-started/locally/) Required

PDF Only Install: 

```
pip install marker-pdf
```

Full Install:

```
pip install marker-pdf[full]
```


Run with interactive GUI
```
pip install streamlit streamlit-ace
marker_gui
```

Convert single File: 
```
marker_single /path/to/file.pdf
```

Convert multiple Files: 
```
marker /path/to/input/folder
```

Options:

- --page_range TEXT: Specify which pages to process. Accepts comma-separated page numbers and ranges. Example: --page_range "0,5-10,20" will process pages 0, 5 through 10, and page 20.
- --output_format [markdown|json|html|chunks]: Specify the format for the output results.
- --output_dir PATH: Directory where output files will be saved. Defaults to the value specified in settings.OUTPUT_DIR.
- --paginate_output: Paginates the output, using \n\n{PAGE_NUMBER} followed by - * 48, then \n\n
- --use_llm: Uses an LLM to improve accuracy. You will need to configure the LLM backend - see below.
- --force_ocr: Force OCR processing on the entire document, even for pages that might contain extractable text. This will also format inline math properly.
- --block_correction_prompt: if LLM mode is active, an optional prompt that will be used to correct the output of marker. This is useful for custom formatting or logic that you want to apply to the output.
- --strip_existing_ocr: Remove all existing OCR text in the document and re-OCR with surya.
- --redo_inline_math: If you want the absolute highest quality inline math conversion, use this along with --use_llm.
- --disable_image_extraction: Don't extract images from the PDF. If you also specify --use_llm, then images will be replaced with a description.
- --debug: Enable debug mode for additional logging and diagnostic information.
- --processors TEXT: Override the default processors by providing their full module paths, separated by commas. Example: --processors "module1.processor1,module2.processor2"
- --config_json PATH: Path to a JSON configuration file containing additional settings.
- config --help: List all available builders, processors, and converters, and their associated configuration. These values can be used to build a JSON configuration file for additional tweaking of marker defaults.
- --converter_cls: One of marker.converters.pdf.PdfConverter (default) or marker.converters.table.TableConverter. The PdfConverter will convert the whole PDF, the TableConverter will only extract and convert tables.
- --llm_service: Which llm service to use if --use_llm is passed. This defaults to marker.services.gemini.GoogleGeminiService.
- --help: see all of the flags that can be passed into marker. (it supports many more options then are listed above)
The list of supported languages for surya OCR is here. If you don't need OCR, marker can work with any language.
