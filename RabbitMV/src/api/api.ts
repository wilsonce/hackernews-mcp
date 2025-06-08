// src/api/api.ts
import axios from 'axios';
import { VodItem, VodDetail } from '../types'; // Assuming types are in ../types

// Define the base URL for the API
const API_BASE_URL = 'https://www.rabbitmv.top';

// Create an Axios instance
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000, // 10 seconds timeout
});

// Interface for the API list response structure.
// This is a common pattern; adjust if the actual API response is different.
// We expect the list of VOD items to be under a 'list' key, and pagination info.
interface ApiListResponse<T> {
  list: T[];
  page: number;
  pagecount: number;
  limit: number; // items per page
  total: number; // total items
  // Potentially other fields like code, msg
  code?: number;
  msg?: string;
}

// Interface for the API detail response structure.
// Often, detail endpoints might return the object directly or nested under a 'data' key.
// For this API, the documentation implies it might be a list with one item when using 'ids'.
// Let's assume it returns an object with a 'list' containing a single detail item.
interface ApiDetailResponse<T> {
  list: T[]; // Expecting a single item array for detail
  // Potentially other fields
  code?: number;
  msg?: string;
}


/**
 * Fetches a list of VOD items.
 * Used for home screen, movie/TV show lists, and search results.
 * @param params - Object containing query parameters like t, pg, wd, year, etc.
 *                 Example: { t: 1, pg: 1 } for first page of movies with type ID 1
 *                          { wd: 'keyword' } for searching
 */
export const getVodList = async (params: {
  t?: number | string; // Category ID
  pg?: number;         // Page number
  wd?: string;         // Search keyword
  year?: string | number;
  // Add other potential filter parameters here based on API capabilities
  [key: string]: any; // Allow other dynamic parameters
}): Promise<ApiListResponse<VodItem>> => {
  try {
    const response = await apiClient.get<ApiListResponse<VodItem>>('/api.php/provide/vod', { params });
    // It's good practice to check response.data structure here
    // For example, if response.data.list is not an array, throw an error or return empty
    if (!response.data || !Array.isArray(response.data.list)) {
      console.error('Invalid API response structure for getVodList:', response.data);
      // Return a structure that matches ApiListResponse<VodItem> to avoid breaking components
      return { list: [], page: params.pg || 1, pagecount: 0, limit: 0, total: 0 };
    }
    return response.data;
  } catch (error) {
    console.error('Error fetching VOD list:', error);
    throw error; // Re-throw to be handled by the caller
  }
};

/**
 * Fetches detailed information for a specific VOD item.
 * @param id - The VOD ID (vod_id)
 */
export const getVodDetail = async (id: number): Promise<VodDetail | null> => {
  try {
    const params = {
      ac: 'detail',
      ids: id.toString(),
    };
    // The API seems to return a list even for details when using 'ids'
    const response = await apiClient.get<ApiDetailResponse<VodDetail>>('/api.php/provide/vod', { params });

    // Assuming the actual detail object is the first item in the 'list' array
    if (response.data && response.data.list && response.data.list.length > 0) {
      return response.data.list[0];
    } else {
      console.warn(`No VOD detail found for ID: ${id}`, response.data);
      return null; // Or throw an error if preferred
    }
  } catch (error) {
    console.error(`Error fetching VOD detail for ID ${id}:`, error);
    throw error; // Re-throw to be handled by the caller
  }
};

// Placeholder for getActorDetail if needed in the future
// export const getActorDetail = async (id: number): Promise<any> => {
//   try {
//     const params = {
//       ac: 'detail', // This might be different for actors
//       ids: id.toString(),
//     };
//     const response = await apiClient.get('/api.php/provide/actor', { params });
//     return response.data; // Adjust based on actual actor API response
//   } catch (error) {
//     console.error(`Error fetching actor detail for ID ${id}:`, error);
//     throw error;
//   }
// };
