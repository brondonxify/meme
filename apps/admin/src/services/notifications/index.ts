import { apiClientRequest, ApiResponse } from '@/lib/api-client';

export interface Notification {
  id: number;
  staff_id: number;
  title: string;
  message: string;
  is_read: boolean;
  published: boolean;
  created_at: string;
  updated_at: string;
}

export async function fetchNotifications(
  { staffId }: { staffId: string }
): Promise<Notification[]> {
  const response = await apiClientRequest<ApiResponse<Notification[]>>(
    `/api/v1/notifications?staffId=${staffId}&published=true`
  );
  return response.data || [];
}

export async function deleteNotification(
  { notificationId }: { notificationId: string }
) {
  return apiClientRequest<ApiResponse<null>>(`/api/v1/notifications/${notificationId}`, {
    method: 'PUT',
    data: { published: false },
  });
}

export async function fetchNotificationsCount(
  { staffId }: { staffId: string }
): Promise<number> {
  const response = await apiClientRequest<ApiResponse<{ count: number }>>(
    `/api/v1/notifications/count?staffId=${staffId}&isRead=false`
  );
  return response.data?.count || 0;
}
