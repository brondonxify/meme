import { Metadata } from "next";
import { redirect } from "next/navigation";

import PageTitle from "@/components/shared/PageTitle";
import EditProfileForm from "./_components/EditProfileForm";
import { serverApiRequest, ApiResponse } from "@/lib/server-api-client";
import { Staff } from "@/services/staff";

export const metadata: Metadata = {
  title: "Edit Profile",
};

async function getStaffDetails(): Promise<Staff | null> {
  const response = await serverApiRequest<ApiResponse<Staff>>(
    "/api/v1/staff/me"
  );
  return response.data || null;
}

export default async function EditProfilePage() {
  const profile = await getStaffDetails();

  if (!profile) {
    redirect("/login");
  }

  return (
    <section>
      <PageTitle>Edit Profile</PageTitle>

      <EditProfileForm profile={profile} />
    </section>
  );
}
