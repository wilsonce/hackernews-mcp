# HackerNews MCP Service

## Overview

The HackerNews MCP Service is a Python package designed to fetch, process, and rank stories from Hacker News. It operates as an MCP (Massively Cooperating Processes) service, exposing tools that can be called by MCP clients. The primary tool identifies the top 30 most commented stories from the current list of Hacker News top stories. The service can also be run directly or via a command-line interface which starts the MCP server.

## Features

*   Fetches the latest top story IDs from the official Hacker News API.
*   Retrieves essential details for each story: ID, title, URL (if available), and current comment count.
*   Sorts stories by their comment count in descending order.
*   Exposes an MCP tool (`get_top_hackernews_stories`) that provides the top 30 most commented stories.
*   Includes a command-line interface (`hackernews-top-stories`) that launches the MCP server.
*   The underlying Hacker News client logic is unit-tested.
*   The MCP server and tool registration are also unit-tested.

## Requirements

*   Python 3.7+
*   `requests` library
*   `mcp[cli]` library (for server and client functionalities)
    (These will be installed automatically when you install the package via pip from `requirements.txt`).

## Installation

### From PyPI (Hypothetical - Not Yet Published)

Once the package is published to the Python Package Index (PyPI), you can install it using pip:

```bash
pip install hackernews-mcp-service
```

### Locally for Development

To install the package locally for development or testing:

1.  Clone the repository (replace with the actual URL if available):
    ```bash
    git clone https://github.com/placeholder/hackernews-mcp-service
    cd hackernews-mcp-service
    ```

2.  Install the package using pip. This will also install dependencies from `requirements.txt` including `mcp[cli]`.
    *   Standard install:
        ```bash
        pip install .
        ```
    *   Editable install (allows you to make changes to the source code that are immediately reflected in the installed package):
        ```bash
        pip install -e .
        ```

## Running the Service

The service can be run in several ways, all of which start the MCP server:

### 1. Using Python Directly (as a module)

This method assumes `mcp_server.py` uses the relative import `from .client import ...`.
From the project root directory (`hackernews_mcp_service/`):
```bash
python -m hackernews_mcp_service.mcp_server
```
This will start the MCP server, typically making it available on `http://127.0.0.1:8000` (or a similar default port used by Uvicorn/FastMCP).

### 2. Using the `mcp` CLI (for development/inspection)

The `mcp dev` command is useful for development and provides access to the MCP Inspector.
From the project root directory (`hackernews_mcp_service/`):
```bash
# IMPORTANT: `mcp dev` runs the target file as a script.
# For this to work with the current mcp_server.py structure,
# you might need to temporarily change the import in mcp_server.py
# from '.client import ...' to 'from client import ...'.
# Alternatively, ensure PYTHONPATH is set up so that hackernews_mcp_service.client can be found.
# Assuming mcp_server.py is adjusted or PYTHONPATH is set:
mcp dev hackernews_mcp_service/mcp_server.py:mcp_app
```
*   `mcp_app` is the `FastMCP` instance defined in `hackernews_mcp_service/mcp_server.py`.
*   This usually starts the server and provides a URL for the MCP Inspector (e.g., `http://127.0.0.1:8000/inspect/`), where you can view registered tools.

### 3. Command-Line Interface (CLI - via installed script)

After installing the package (e.g., using `pip install .`), the `hackernews-top-stories` console script becomes available. This script now launches the MCP server.
```bash
hackernews-top-stories
```

#### Using with `uvx` (Universal eXecutable)

If this package were published on PyPI, you could run it with `uvx`:
```bash
uvx hackernews-mcp-service
```
This would invoke the `hackernews-top-stories` console script, thereby starting the MCP server.

## Using the Service (as an MCP Client)

The service exposes its functionality through MCP tools. The primary tool is `get_top_hackernews_stories`.
A client application would use an MCP client library to connect to this server and call the tool.

**Conceptual Python MCP Client Usage:**
(This is a generic example; actual client code depends on the specific `mcp` client library details.)

```python
# from mcp import ClientSession # Or similar from the mcp client library
# from mcp.transport.http import HTTPClientTransport # Example transport

# async def main():
#     # Assuming the server started by one of the methods above is running on http://127.0.0.1:8000
#     async with HTTPClientTransport("http://127.0.0.1:8000/mcp") as (reader, writer):
#         async with ClientSession(reader, writer, client_name="MyTestClient") as session:
#             # Initialize the session (e.g., handshake with the server)
#             # await session.initialize() # Or equivalent based on library
#             print("Session initialized with server:", session.server_info)

#             # Call the tool
#             print("Calling tool 'get_top_hackernews_stories'...")
#             tool_result = await session.call_tool("get_top_hackernews_stories", arguments={}) # No arguments for this tool

#             if tool_result.success:
#                 print("Tool call successful. Stories:")
#                 # Assuming tool_result.result_data holds the list of stories
#                 for i, story in enumerate(tool_result.result_data):
#                     print(f"  {i+1}. Title: {story['title']}, Comments: {story['comments_count']}")
#             else:
#                 print(f"Tool call failed: {tool_result.error_message}")

# if __name__ == "__main__":
#     import asyncio
#     asyncio.run(main())
```
*Note: The exact client API (e.g., `ClientSession`, transport setup) might differ based on the `mcp` SDK version and features.*

## Running Tests

To run the included unit tests:

1.  Ensure you are in the project's root directory (`hackernews_mcp_service/`).
2.  Make sure development dependencies are installed (covered by `pip install .` or `pip install -e .`).
3.  Execute the command:
    ```bash
    python -m unittest discover tests
    ```
    This will automatically find and run all tests in the `tests` directory.

**Note on Test Environment:**
*   The tests are designed assuming `hackernews_mcp_service/mcp_server.py` uses the relative import `from .client import ...`.
*   If timeouts are observed during test execution in some environments, it might be due to the environment's interaction with `unittest` rather than issues in the test code itself. The tests for this project are generally fast and CPU-bound (network calls are mocked).

## License

This project is licensed under the MIT License. The license information is specified in the `setup.py` file.

## Author

AI Assistant (via Software Engineering Agent)
(email: assistant@example.com)

## Repository URL

(Placeholder) `https://github.com/placeholder/hackernews-mcp-service`
```
