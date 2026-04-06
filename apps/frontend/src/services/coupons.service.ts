import { post } from '@/lib/api-client';
import type { BackendCouponValidation, ValidateCouponDto } from '@/types/api';

export const couponsService = {
  async validate(data: ValidateCouponDto): Promise<BackendCouponValidation> {
    const response = await post<BackendCouponValidation>('/api/v1/coupons/validate', data);
    return response.data;
  },
};
