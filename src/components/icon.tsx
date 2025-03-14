"use client";

import { Icon } from "@iconify/react";
import { useTheme } from "next-themes";

interface IconProps {
  icon: string;
  height?: number;
}

const App = ({ icon, height }: IconProps) => {
  const { theme } = useTheme();
  return (
    <Icon
      cursor="pointer"
      icon={icon}
      height={height ?? 30}
      color={theme === "dark" ? "#fff" : "#000"}
    />
  );
};

export default App;
