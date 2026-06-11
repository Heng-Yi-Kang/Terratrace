# Unit Test Screenshot Instructions

No `screenshot` placeholders are currently used in `test/unit-test.docx`; every documented unit-test row has Vitest command-output evidence.

If a future row cannot be supported by logs or test output, put `screenshot` in that row's Evidence column and capture the screenshot as follows:

1. Run the relevant feature or test scenario locally.
2. Open the UI state or terminal output that proves the expected behavior.
3. Capture the full browser window or terminal window, including the test case ID when possible.
4. Save the image under `test/evidence/unit/` using the test case ID as the filename, for example `UT-AUTH-001.png`.
5. Replace the placeholder later with the saved screenshot path if the document format allows attachments or links.
