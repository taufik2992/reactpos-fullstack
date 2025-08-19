import React from "react";
import { Header } from "./Header";
import { BottomNavigation } from "./BottomNavigation";

interface UserLayoutProps {
  children: React.ReactNode;
}

export const UserLayout: React.FC<UserLayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-16">
      <Header />
      <main className="p-4 sm:p-6 lg:p-8">
        <div className="">{children}</div>
      </main>
      <BottomNavigation />
    </div>
  );
};
