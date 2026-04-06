import { post } from '@/lib/api-client';
import type { ContactMessageDto } from '@/types/api';

export const contactService = {
  async submitMessage(data: ContactMessageDto): Promise<void> {
    await post<void>('/api/v1/contact', data);
  },
};
