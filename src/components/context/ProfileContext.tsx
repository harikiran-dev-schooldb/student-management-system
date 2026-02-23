"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from "react";
import { useParams } from "next/navigation";
import { tenantFetch } from "@/lib/tenantFetch";

export type Role = {
  id: number;
  role: string;
  username: string;
  profileId: string;
};

export type Profile = {
  id: string;
  phone: string;
  clerk_id: string;
  activeUserId: number;
  roles: Role[];
  activeRole?: Role;
};

type ProfileContextType = {
  profile: Profile | null;
  loading: boolean;
  switchRole: (roleId: number) => Promise<void>;
  refreshProfile: () => Promise<void>;
};

const ProfileContext = createContext<ProfileContextType | null>(null);

export function ProfileProvider({ children }: { children: React.ReactNode }) {
  const { schoolId } = useParams<{ schoolId: string }>();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = useCallback(async () => {
    if (!schoolId) return;

    try {
      setLoading(true);

      const data = await tenantFetch<Profile>(
        schoolId,
        "/profile"
      );

      setProfile(data);
    } catch (error) {
      console.error("Profile fetch failed:", error);
      setProfile(null);
    } finally {
      setLoading(false);
    }
  }, [schoolId]);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  const switchRole = async (roleId: number) => {
    if (!schoolId) return;

    try {
      setLoading(true);

      await tenantFetch(schoolId, "/switch-role", {
        method: "POST",
        body: JSON.stringify({ roleId }),
      });

      await fetchProfile();
    } catch (error) {
      console.error("Switch role failed:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ProfileContext.Provider
      value={{ profile, loading, switchRole, refreshProfile: fetchProfile }}
    >
      {children}
    </ProfileContext.Provider>
  );
}

export function useProfile() {
  const context = useContext(ProfileContext);
  if (!context) {
    throw new Error("useProfile must be used within ProfileProvider");
  }
  return context;
}