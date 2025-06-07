import unittest
from unittest.mock import patch, MagicMock

# Assuming mcp_server.py and client.py are in hackernews_mcp_service directory,
# and tests are run from project root.
# The import 'from ..hackernews_mcp_service.mcp_server import mcp_app ...' reflects that
# 'tests' is a sibling to the 'hackernews_mcp_service' package directory if tests are run as top-level scripts.
# However, for 'python -m unittest discover tests', the project root is added to sys.path.
from hackernews_mcp_service.mcp_server import mcp_app, get_top_hackernews_stories_tool
from hackernews_mcp_service.client import main_cli

class TestMCPServer(unittest.TestCase):

    @patch('hackernews_mcp_service.mcp_server.get_hackernews_top_stories_mcp')
    def test_get_top_hackernews_stories_tool(self, mock_get_mcp_data):
        print("Running TestMCPServer.test_get_top_hackernews_stories_tool")
        mock_stories = [{'id': 1, 'title': 'Mocked Story', 'comments_count': 99, 'url': 'http://mock.url'}]
        mock_get_mcp_data.return_value = mock_stories

        # Call the tool function directly
        result = get_top_hackernews_stories_tool()

        mock_get_mcp_data.assert_called_once()
        self.assertEqual(result, mock_stories)
        print("Finished TestMCPServer.test_get_top_hackernews_stories_tool")

    # Patching 'mcp_app.run' which is accessed via 'from .mcp_server import mcp_app' inside client.main_cli
    @patch('hackernews_mcp_service.mcp_server.mcp_app.run')
    def test_main_cli_runs_mcp_app(self, mock_mcp_app_run):
        print("Running TestMCPServer.test_main_cli_runs_mcp_app")

        # Call main_cli from client.py
        main_cli()

        mock_mcp_app_run.assert_called_once()
        print("Finished TestMCPServer.test_main_cli_runs_mcp_app")

if __name__ == '__main__':
    unittest.main()
