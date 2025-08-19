import React, { createContext, useContext, useEffect, useState } from "react";
import { useAuth } from "./AuthContext";
import { shiftAPI } from "../services/api";
import toast from "react-hot-toast";

interface WorkShiftContextType {
  isShiftActive: boolean;
  shiftStartTime: Date | null;
  elapsedTime: number;
  remainingTime: number;
  startShift: () => void;
  endShift: () => void;
  formatTime: (seconds: number) => string;
  loading: boolean;
}

const WorkShiftContext = createContext<WorkShiftContextType | undefined>(
  undefined
);

const SHIFT_DURATION = 8 * 60 * 60; // 8 hours in seconds

export const WorkShiftProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { user, logout } = useAuth();
  const [isShiftActive, setIsShiftActive] = useState(false);
  const [shiftStartTime, setShiftStartTime] = useState<Date | null>(null);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [remainingTime, setRemainingTime] = useState(SHIFT_DURATION);
  const [loading, setLoading] = useState(false);

  // Load current shift data from API
  useEffect(() => {
    const loadCurrentShift = async () => {
      if (user?.role === "cashier") {
        try {
          const response = await shiftAPI.getCurrent();
          if (response.data.success && response.data.shift) {
            const shift = response.data.shift;
            const start = new Date(shift.clockIn);
            const now = new Date();
            const elapsed = Math.floor(
              (now.getTime() - start.getTime()) / 1000
            );

            if (shift.status === "active" && elapsed < SHIFT_DURATION) {
              setIsShiftActive(true);
              setShiftStartTime(start);
              setElapsedTime(elapsed);
              setRemainingTime(SHIFT_DURATION - elapsed);
            }
          }
        } catch (error) {
          console.error("Error loading current shift:", error);
        }
      }
    };

    loadCurrentShift();
  }, [user]);

  // Timer effect
  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (isShiftActive && shiftStartTime) {
      interval = setInterval(() => {
        const now = new Date();
        const elapsed = Math.floor(
          (now.getTime() - shiftStartTime.getTime()) / 1000
        );
        const remaining = SHIFT_DURATION - elapsed;

        setElapsedTime(elapsed);
        setRemainingTime(remaining);

        // Warning notifications
        if (remaining === 30 * 60) {
          // 30 minutes left
          // Replace all toast.warning calls with:
          toast("Waktu kerja Anda tersisa 30 menit!", {
            icon: "⏰",
            duration: 5000,
            style: {
              background: "#ffb347", // orange color for warning
              color: "#fff",
            },
          });
        } else if (remaining === 15 * 60) {
          // 15 minutes left
          toast("Waktu kerja Anda tersisa 15 menit!", {
            icon: "⏰",
            duration: 5000,
            style: {
              background: "#ffb347", // orange color for warning
              color: "#fff",
            },
          });
        } else if (remaining === 5 * 60) {
          // 5 minutes left
          toast("Waktu kerja Anda tersisa 5 menit!", {
            icon: "⏰",
            duration: 5000,
            style: {
              background: "#ffb347", // orange color for warning
              color: "#fff",
            },
          });
        } else if (remaining <= 0) {
          // Shift ended
          endShift();
          toast.error("Shift 8 jam Anda telah berakhir. Keluar...", {
            duration: 5000,
          });
          setTimeout(() => {
            logout();
          }, 2000);
        }
      }, 1000);
    }

    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [isShiftActive, shiftStartTime, logout]);

  const startShift = async () => {
    if (user?.role !== "cashier" || loading) return;

    setLoading(true);
    try {
      // Shift is automatically started when user logs in
      // This function is mainly for UI feedback
      const now = new Date();
      setIsShiftActive(true);
      setShiftStartTime(now);
      setElapsedTime(0);
      setRemainingTime(SHIFT_DURATION);

      toast.success("Work shift started! You have 8 hours.", {
        duration: 3000,
      });
    } catch (error) {
      toast.error("Failed to start shift");
    } finally {
      setLoading(false);
    }
  };

  const endShift = async () => {
    if (user?.role !== "cashier" || loading) return;

    setLoading(true);
    try {
      await shiftAPI.clockOut();

      setIsShiftActive(false);
      setShiftStartTime(null);
      setElapsedTime(0);
      setRemainingTime(SHIFT_DURATION);

      toast.success("Work shift ended successfully!", { duration: 3000 });
    } catch (error) {
      toast.error("Failed to end shift");
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, "0")}:${minutes
      .toString()
      .padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <WorkShiftContext.Provider
      value={{
        isShiftActive,
        shiftStartTime,
        elapsedTime,
        remainingTime,
        startShift,
        endShift,
        formatTime,
        loading,
      }}
    >
      {children}
    </WorkShiftContext.Provider>
  );
};

export const useWorkShift = () => {
  const context = useContext(WorkShiftContext);
  if (context === undefined) {
    throw new Error("useWorkShift must be used within a WorkShiftProvider");
  }
  return context;
};
