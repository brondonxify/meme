import apiClient from '../lib/api';

export interface Specification {
    id: number;
    name: string;
}

export const specificationsService = {
    getAll: async () => {
        const response = await apiClient.get<Specification[]>('/specifications');
        return response.data;
    }
};
