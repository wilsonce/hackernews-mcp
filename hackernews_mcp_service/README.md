# HackerNews MCP Service

## Overview

The HackerNews MCP Service is a Python package designed to fetch, process, and rank stories from Hacker News. It specifically identifies the top 30 most commented stories from the current list of top stories, making them available for integration into other systems (like an MCP) or for direct viewing via a command-line interface.

## Features

*   Fetches the latest top story IDs from the official Hacker News API.
*   Retrieves essential details for each story: ID, title, URL (if available), and current comment count.
*   Sorts stories by their comment count in descending order.
*   Provides the top 30 most commented stories.
*   Offers a primary callable function (`get_hackernews_top_stories_mcp`) for easy MCP integration.
*   Includes a command-line interface (CLI) tool (`hackernews-top-stories`) for direct execution and viewing of results, compatible with tools like `uvx`.
*   Comes with a suite of unit tests for core logic.

## Requirements

*   Python 3.7+
*   `requests` library (this will be installed automatically when you install the package).

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

2.  Install the package using pip. You can choose a standard install or an editable install:
    *   Standard install:
        ```bash
        pip install .
        ```
    *   Editable install (allows you to make changes to the source code that are immediately reflected in the installed package):
        ```bash
        pip install -e .
        ```

## Usage

### Command-Line Interface (CLI)

After installation, you can use the `hackernews-top-stories` command directly in your terminal:

```bash
hackernews-top-stories
```

This command will execute the service, fetch the latest data, and print the top 30 most commented Hacker News stories to your console, including their title, comment count, and URL.

#### Using with `uvx` (Universal eXecutable)

If this package were published on PyPI, you could potentially run it with `uvx` (assuming `uvx` is configured to use the console script entry points defined in Python packages):

```bash
uvx hackernews-mcp-service
```
This would invoke the same `hackernews-top-stories` script.

### As an MCP Service (Python Integration)

The primary function designed for integration into an MCP (or any Python application) is `get_hackernews_top_stories_mcp()`.

Here's a basic example of how to use it:

```python
from hackernews_mcp_service.client import get_hackernews_top_stories_mcp

def your_mcp_handler_or_application_logic():
    print("Fetching top Hacker News stories for MCP...")
    top_stories = get_hackernews_top_stories_mcp()

    if top_stories:
        print(f"Retrieved {len(top_stories)} stories:")
        for i, story in enumerate(top_stories):
            print(f"  {i+1}. Title: {story.get('title')}")
            print(f"     Comments: {story.get('comments_count')}")
            print(f"     URL: {story.get('url')}")
        # Further process the top_stories list as needed by your MCP framework
        return top_stories # Or however your MCP framework expects data
    else:
        print("Could not retrieve top stories.")
        return None # Handle error appropriately

if __name__ == "__main__":
    # Example of direct invocation
    results = your_mcp_handler_or_application_logic()
    if results:
        print("\nSuccessfully processed stories in example handler.")
```

## Running Tests

To run the included unit tests:

1.  Ensure you are in the project's root directory (`hackernews-mcp-service/`).
2.  Make sure any development dependencies are installed (though for this project, `requests` is the main one and should be covered by a local install).
3.  Execute the following command:

    ```bash
    python -m unittest discover tests
    ```
    This will automatically find and run all tests located in the `tests` directory.

## License

This project is licensed under the MIT License. The license information is specified in the `setup.py` file. (Typically, a `LICENSE` file would also be present in the repository root).

## Author

AI Assistant (via Software Engineering Agent)
(email: assistant@example.com)

## Repository URL

(Placeholder) `https://github.com/placeholder/hackernews-mcp-service`
```
