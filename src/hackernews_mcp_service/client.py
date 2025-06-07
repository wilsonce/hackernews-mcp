import requests
import concurrent.futures

def fetch_top_story_ids():
    """
    Fetches the top story IDs from the Hacker News API.

    Returns:
        list: A list of top story IDs, or None if an error occurs.
    """
    url = "https://hacker-news.firebaseio.com/v0/topstories.json"
    try:
        response = requests.get(url)
        response.raise_for_status()  # Raise an exception for bad status codes (4xx or 5xx)
        story_ids = response.json()
        return story_ids
    except requests.exceptions.RequestException as e:
        # print(f"Error fetching top story IDs: {e}")
        return None
    except ValueError as e: # Handles JSON decoding errors
        # print(f"Error decoding JSON response: {e}")
        return None

def fetch_story_details(story_id):
    """
    Fetches details for a given story ID from the Hacker News API.

    Args:
        story_id (int): The ID of the story to fetch.

    Returns:
        dict: A dictionary containing story details (id, title, url, comments_count),
              or None if an error occurs or the item is not a story.
    """
    url = f"https://hacker-news.firebaseio.com/v0/item/{story_id}.json"
    try:
        response = requests.get(url)
        response.raise_for_status()
        item = response.json()

        if item is None: # Handles cases where the item might be null (e.g., deleted item)
            # print(f"No data for story ID: {story_id}. Item might be deleted or invalid.")
            return None

        if item.get("type") == "story":
            story_details = {
                "id": item.get("id"),
                "title": item.get("title"),
                "url": item.get("url", ""),  # Default to empty string if URL is not present
                "comments_count": item.get("descendants", 0)  # Default to 0 if descendants is not present
            }
            return story_details
        else:
            # print(f"Item with ID {story_id} is not a story (type: {item.get('type')}).")
            return None
    except requests.exceptions.RequestException as e:
        # print(f"Error fetching details for story ID {story_id}: {e}")
        return None
    except ValueError as e: # Handles JSON decoding errors
        # print(f"Error decoding JSON response for story ID {story_id}: {e}")
        return None
    except AttributeError as e: # Handles cases where item might not be a dict (e.g. if item is None and .get is called)
        # print(f"Error processing item data for story ID {story_id}: {e}. Item might be malformed.")
        return None

def get_top_commented_stories(num_stories=30):
    """
    Fetches top stories, sorts them by comment count, and returns the top N.

    Args:
        num_stories (int): The number of top commented stories to return.

    Returns:
        list: A list of story detail dictionaries, sorted by comments_count,
              or None if initial story ID fetching fails.
    """
    # print(f"Fetching top story IDs to find the top {num_stories} commented stories...")
    top_story_ids = fetch_top_story_ids()

    if not top_story_ids:
        # print("Could not fetch top story IDs. Aborting.")
        return None

    all_story_details = []
    # HN typically returns around 500 top story IDs.
    # Processing all of them can take time.
    # Limit to num_stories * 2 to get enough stories to sort and pick the top N
    ids_to_process = top_story_ids[:num_stories * 2]
    # print(f"Processing {len(ids_to_process)} story IDs for details concurrently...")

    # Use ThreadPoolExecutor for concurrent fetching
    with concurrent.futures.ThreadPoolExecutor(max_workers=10) as executor:
        # Submit fetch_story_details for each story_id
        future_to_story_id = {executor.submit(fetch_story_details, story_id): story_id for story_id in ids_to_process}
        for future in concurrent.futures.as_completed(future_to_story_id):
            story_id = future_to_story_id[future]
            try:
                details = future.result()
                if details:
                    all_story_details.append(details)
            except Exception as exc:
                # print(f"Story ID {story_id} generated an exception: {exc}")
                pass # Continue processing other stories even if one fails

    if not all_story_details:
        # print("No story details could be fetched.")
        return []

    # Sort stories by 'comments_count' in descending order
    # The key for sorting was 'descendants' in the previous subtask, but the dictionary
    # returned by fetch_story_details uses 'comments_count'.
    # Using 'comments_count' as per the requirement to sort based on 'descendants' (which is stored as 'comments_count').
    try:
        sorted_stories = sorted(all_story_details, key=lambda x: x.get('comments_count', 0), reverse=True)
    except TypeError as e:
        # print(f"Error sorting stories: {e}. This might happen if 'comments_count' is not always an integer.")
        # Fallback: return unsorted list or handle more gracefully
        return all_story_details[:num_stories]


    # print(f"Successfully fetched and sorted {len(sorted_stories)} stories.")
    return sorted_stories[:num_stories]

def get_hackernews_top_stories_mcp():
    """
    MCP Service Endpoint: Fetches the top 30 Hacker News stories sorted by comment count.

    Returns:
        list: A list of top 30 story dictionaries, or None if fetching fails.
    """
    # print("MCP Service: Calling get_top_commented_stories(num_stories=30)")
    return get_top_commented_stories(num_stories=30)

def main_cli():
    '''
    Command-line interface to run the HackerNews MCP Service.
    This will start the MCP server.
    '''
    # print("Starting HackerNews MCP Service via main_cli...")
    # Import mcp_app from mcp_server.py within the same package
    from .mcp_server import mcp_app
    mcp_app.run()

# The if __name__ == "__main__": block has been removed.
# main_cli() function definition remains for potential direct script use if needed,
# but it won't be executed automatically when the module is imported or run
# via python -m hackernews_mcp_service.client (which would look for a -m compatible main).
# get_hackernews_top_stories_mcp() and other helper functions remain for the MCP tool.
