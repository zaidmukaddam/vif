"use client";

import { useState, useEffect, FC, ReactElement } from "react";
import { useTheme } from "next-themes";
import { Sun, Moon, Desktop, IconProps } from "@phosphor-icons/react";
import { cn } from "@/lib/utils";

type ThemeMode = "Light" | "Dark" | "System";

interface ThemeButtonProps {
  mode: ThemeMode;
  icon: FC<IconProps>;
  isActive: boolean;
  onClick: () => void;
}

const ThemeButton: FC<ThemeButtonProps> = ({
  mode,
  icon: Icon,
  isActive,
  onClick,
}) => {
  return (
    <button
      onClick={onClick}
      className={cn(
        "rounded-full p-1.5 transition-colors duration-200 ease-in-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
        isActive
          ? "bg-background text-foreground shadow-sm"
          : "text-muted-foreground hover:bg-muted-foreground/10"
      )}
      aria-label={`Switch to ${mode} Mode`}
    >
      <Icon className="h-4 w-4" weight={isActive ? "fill" : "regular"} />
    </button>
  );
};

export const ThemeToggleButton: FC = (): ReactElement => {
  const { theme, setTheme } = useTheme();
  const [isMounted, setIsMounted] = useState<boolean>(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return (
      <div className="h-9 w-[110px] rounded-full bg-muted animate-pulse" />
    );
  }

  return (
    <div className="flex items-center space-x-1 rounded-full bg-muted p-0.5">
      <ThemeButton
        mode="Light"
        icon={Sun}
        isActive={theme === "light"}
        onClick={() => setTheme("light")}
      />
      <ThemeButton
        mode="Dark"
        icon={Moon}
        isActive={theme === "dark"}
        onClick={() => setTheme("dark")}
      />
      <ThemeButton
        mode="System"
        icon={Desktop}
        isActive={theme === "system"}
        onClick={() => setTheme("system")}
      />
    </div>
  );
};
