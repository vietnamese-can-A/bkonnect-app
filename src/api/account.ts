import { apiFetch } from "@/services/apiService";
import type { FoundPost, LostReport, Match } from '@/types/domain';

export async function getActivity() {
    const response = await apiFetch<{
        lostReports: LostReport[];
        foundPosts: FoundPost[];
        matches: Match[];
      }>('/user/activities');

      if (!response.success){
        throw Error(response.message)
      }

      return response.data
}