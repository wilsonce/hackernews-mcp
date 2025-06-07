import unittest
from unittest.mock import patch, MagicMock
import requests # Import requests for requests.exceptions.RequestException

# Assuming client.py is in hackernews_mcp_service directory, and tests are run from project root
from hackernews_mcp_service.client import (
    fetch_top_story_ids,
    fetch_story_details,
    get_top_commented_stories, # Import this to test it more directly as well
    get_hackernews_top_stories_mcp
)

class TestHackerNewsClient(unittest.TestCase):

    @patch('hackernews_mcp_service.client.requests.get')
    def test_fetch_top_story_ids_success(self, mock_get):
        print("Running test_fetch_top_story_ids_success")
        expected_ids = [1, 2, 3, 4, 5]
        mock_response = MagicMock()
        mock_response.ok = True
        mock_response.json.return_value = expected_ids
        mock_get.return_value = mock_response

        ids = fetch_top_story_ids()
        self.assertEqual(ids, expected_ids)
        mock_get.assert_called_once_with("https://hacker-news.firebaseio.com/v0/topstories.json")

    @patch('hackernews_mcp_service.client.requests.get')
    def test_fetch_top_story_ids_api_error(self, mock_get):
        print("Running test_fetch_top_story_ids_api_error")
        mock_response = MagicMock()
        mock_response.ok = False
        mock_response.raise_for_status.side_effect = requests.exceptions.HTTPError("API Error")
        mock_get.return_value = mock_response

        ids = fetch_top_story_ids()
        self.assertIsNone(ids)

    @patch('hackernews_mcp_service.client.requests.get')
    def test_fetch_story_details_success(self, mock_get):
        print("Running test_fetch_story_details_success")
        story_data = {'id': 1, 'title': 'Test Story', 'url': 'http://example.com', 'descendants': 10, 'type': 'story'}
        mock_response = MagicMock()
        mock_response.ok = True
        mock_response.json.return_value = story_data
        mock_get.return_value = mock_response

        details = fetch_story_details(1)
        expected_details = {
            "id": 1,
            "title": "Test Story",
            "url": "http://example.com",
            "comments_count": 10
        }
        self.assertEqual(details, expected_details)
        mock_get.assert_called_once_with("https://hacker-news.firebaseio.com/v0/item/1.json")

    @patch('hackernews_mcp_service.client.requests.get')
    def test_fetch_story_details_not_a_story(self, mock_get):
        print("Running test_fetch_story_details_not_a_story")
        job_data = {'id': 2, 'title': 'Test Job', 'type': 'job'}
        mock_response = MagicMock()
        mock_response.ok = True
        mock_response.json.return_value = job_data
        mock_get.return_value = mock_response

        details = fetch_story_details(2)
        self.assertIsNone(details)

    @patch('hackernews_mcp_service.client.requests.get')
    def test_fetch_story_details_api_error(self, mock_get):
        print("Running test_fetch_story_details_api_error")
        mock_response = MagicMock()
        mock_response.ok = False
        mock_response.raise_for_status.side_effect = requests.exceptions.RequestException("API Error")
        mock_get.return_value = mock_response

        details = fetch_story_details(3)
        self.assertIsNone(details)

    @patch('hackernews_mcp_service.client.requests.get')
    def test_fetch_story_details_missing_fields(self, mock_get):
        print("Running test_fetch_story_details_missing_fields")
        # Test missing 'descendants'
        story_data_no_desc = {'id': 4, 'title': 'Story No Descendants', 'url': 'http://example.com/4', 'type': 'story'}
        mock_response_no_desc = MagicMock()
        mock_response_no_desc.ok = True
        mock_response_no_desc.json.return_value = story_data_no_desc

        # Test missing 'url'
        story_data_no_url = {'id': 5, 'title': 'Story No URL', 'descendants': 5, 'type': 'story'}
        mock_response_no_url = MagicMock()
        mock_response_no_url.ok = True
        mock_response_no_url.json.return_value = story_data_no_url

        mock_get.side_effect = [mock_response_no_desc, mock_response_no_url]

        details_no_desc = fetch_story_details(4)
        expected_details_no_desc = {
            "id": 4, "title": "Story No Descendants", "url": "http://example.com/4", "comments_count": 0
        }
        self.assertEqual(details_no_desc, expected_details_no_desc)

        details_no_url = fetch_story_details(5)
        expected_details_no_url = {
            "id": 5, "title": "Story No URL", "url": "", "comments_count": 5
        }
        self.assertEqual(details_no_url, expected_details_no_url)

    @patch('hackernews_mcp_service.client.requests.get')
    def test_get_top_commented_stories_logic(self, mock_get_requests):
        print("Running test_get_top_commented_stories_logic")
        # Mock for fetch_top_story_ids call
        mock_top_stories_response = MagicMock()
        mock_top_stories_response.ok = True
        mock_top_stories_response.json.return_value = [101, 102, 103, 104]

        # Mock responses for fetch_story_details calls
        item_101_data = {'id': 101, 'title': 'Story A', 'descendants': 50, 'type': 'story', 'url': 'url_a'}
        mock_item_101_response = MagicMock()
        mock_item_101_response.ok = True
        mock_item_101_response.json.return_value = item_101_data

        item_102_data = {'id': 102, 'title': 'Story B', 'descendants': 100, 'type': 'story', 'url': 'url_b'}
        mock_item_102_response = MagicMock()
        mock_item_102_response.ok = True
        mock_item_102_response.json.return_value = item_102_data

        item_103_data = {'id': 103, 'title': 'Job Post', 'type': 'job'} # Should be skipped
        mock_item_103_response = MagicMock()
        mock_item_103_response.ok = True
        mock_item_103_response.json.return_value = item_103_data

        item_104_data = {'id': 104, 'title': 'Story C', 'descendants': 75, 'type': 'story', 'url': 'url_c'}
        mock_item_104_response = MagicMock()
        mock_item_104_response.ok = True
        mock_item_104_response.json.return_value = item_104_data

        # Assign side_effect for multiple calls to requests.get
        mock_get_requests.side_effect = [
            mock_top_stories_response,  # For fetch_top_story_ids
            mock_item_101_response,     # For fetch_story_details(101)
            mock_item_102_response,     # For fetch_story_details(102)
            mock_item_103_response,     # For fetch_story_details(103)
            mock_item_104_response      # For fetch_story_details(104)
        ]

        # Test with num_stories=2 to check sorting and limiting
        # get_top_commented_stories is called by get_hackernews_top_stories_mcp
        # We can also test get_top_commented_stories directly if we want fine-grained control
        # For this test, let's call get_top_commented_stories directly

        top_stories = get_top_commented_stories(num_stories=2)

        self.assertEqual(len(top_stories), 2)
        # Expected order: Story B (100), Story C (75)
        self.assertEqual(top_stories[0]['title'], 'Story B')
        self.assertEqual(top_stories[0]['comments_count'], 100)
        self.assertEqual(top_stories[1]['title'], 'Story C')
        self.assertEqual(top_stories[1]['comments_count'], 75)

        # Verify calls: 1 for top stories, 4 for item details
        self.assertEqual(mock_get_requests.call_count, 5)
        mock_get_requests.assert_any_call("https://hacker-news.firebaseio.com/v0/topstories.json")
        mock_get_requests.assert_any_call("https://hacker-news.firebaseio.com/v0/item/101.json")
        mock_get_requests.assert_any_call("https://hacker-news.firebaseio.com/v0/item/102.json")
        mock_get_requests.assert_any_call("https://hacker-news.firebaseio.com/v0/item/103.json")
        mock_get_requests.assert_any_call("https://hacker-news.firebaseio.com/v0/item/104.json")

    @patch('hackernews_mcp_service.client.get_top_commented_stories')
    def test_get_hackernews_top_stories_mcp_passthrough(self, mock_get_top_commented):
        print("Running test_get_hackernews_top_stories_mcp_passthrough")
        expected_result = [{"id": 1, "title": "MCP Test", "comments_count": 10, "url": "mcp.url"}]
        mock_get_top_commented.return_value = expected_result

        result = get_hackernews_top_stories_mcp()

        self.assertEqual(result, expected_result)
        mock_get_top_commented.assert_called_once_with(num_stories=30)

if __name__ == '__main__':
    unittest.main()
