import { apiClient } from '@core/api/client';

// TODO: Define a proper type for the GLTF item
export type GltfItem = any;

export const fetchGltfList = async (): Promise<GltfItem[]> => {
  try {
    const response = await apiClient.get<GltfItem[]>('/gltf');
    return response;
  } catch (error) {
    console.error('Failed to fetch GLTF list:', error);
    throw error;
  }
}; 