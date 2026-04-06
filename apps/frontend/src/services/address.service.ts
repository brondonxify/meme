import { get, post, put, deleteRequest, ApiResponse } from "@/lib/api-client";
import { BackendResponse } from "@/types/api";

export interface ShippingAddress {
    id: number;
    label: string;
    first_name: string;
    last_name: string;
    phone: string;
    address_line: string;
    city: string;
    postal_code: string | null;
    is_default: boolean;
}

export type CreateAddressDto = Omit<ShippingAddress, 'id' | 'is_default'> & { is_default?: boolean };

export const addressService = {
    async getAddresses(): Promise<ShippingAddress[]> {
        const response = await get<ShippingAddress[]>("/api/v1/addresses");
        return response.data;
    },

    async createAddress(data: CreateAddressDto): Promise<ShippingAddress> {
        const response = await post<ShippingAddress>("/api/v1/addresses", data);
        return response.data;
    },

    async updateAddress(id: number, data: Partial<CreateAddressDto>): Promise<ShippingAddress> {
        const response = await put<ShippingAddress>(`/api/v1/addresses/${id}`, data);
        return response.data;
    },

    async deleteAddress(id: number): Promise<void> {
        await deleteRequest(`/api/v1/addresses/${id}`);
    }
};
