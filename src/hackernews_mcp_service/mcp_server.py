from mcp.server.fastmcp import FastMCP

from mcp.server.fastmcp import FastMCP

# Using relative import as it's standard for modules within the same package.
# This is suitable for `python -m unittest` and `python -m <module>` execution.
# `mcp dev` might require specific PYTHONPATH adjustments or a different invocation if it runs the file as a script.
from hackernews_mcp_service.client import get_hackernews_top_stories_mcp

# Create an MCP server instance
# The name "HackerNewsService" can be adjusted if needed.
mcp_app = FastMCP(name="HackerNewsService", description="Provides top Hacker News stories.")

@mcp_app.tool(name="get_top_hackernews_stories", description="Fetches the top 30 most commented Hacker News stories.")
def get_top_hackernews_stories_tool() -> list[dict]:
    '''
    Provides a list of the top 30 Hacker News stories, sorted by comment count.
    Each story is a dictionary with 'id', 'title', 'url', and 'comments_count'.
    '''
    # print("MCP Tool: get_top_hackernews_stories_tool called. Delegating to get_hackernews_top_stories_mcp.")
    return get_hackernews_top_stories_mcp()

if __name__ == "__main__":
    # This allows running the server directly using:
    # python -m hackernews_mcp_service.mcp_server
    # or, if in the package directory: python mcp_server.py
    # print("Attempting to run MCP server for a dry run...")
    mcp_app.run()
