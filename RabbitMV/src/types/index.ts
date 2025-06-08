// src/types/index.ts

// Interface for items in VOD lists (e.g., Home, MovieList, TVShowList, SearchResults)
export interface VodItem {
  vod_id: number;
  vod_name: string;
  vod_pic: string;         // URL for the poster image
  vod_remarks?: string;     // e.g., "HD", "更新至10集"
  vod_time?: string;        // Last update time
  type_name?: string;       // Category, e.g., "动作片"
  vod_year?: string;
  vod_area?: string;
  // Add any other fields that commonly appear in list views
  // For example, if the API returns a score or a brief summary here
}

// Interface for the detailed information of a VOD item
export interface VodDetail extends VodItem {
  vod_director?: string;    // Director(s)
  vod_actor?: string;       // Actor(s)
  vod_content?: string;     // Synopsis/plot details
  vod_play_url: string;    // String with playback URLs, e.g., "第一集$url1#第二集$url2"
  vod_blurb?: string;       // Short summary or tagline
  vod_class?: string;       // Detailed genre classification
  // Include all fields available from the ac=detail API endpoint
}

// Interface for parsed episode/playback link
export interface PlayLink {
  episode: string;
  url: string;
}

// You might also want a generic API response structure if the API is consistent
// For example:
// export interface ApiResponse<T> {
//   code: number;
//   msg: string;
//   list?: T[]; // For lists of items
//   data?: T;   // For a single item detail
//   page?: number;
//   pagecount?: number;
//   limit?: number;
//   total?: number;
// }

// For now, we will keep it simple with VodItem and VodDetail
// and refine ApiResponse if needed once we start implementing the API calls.
