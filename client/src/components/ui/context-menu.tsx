import React, { ReactNode, useState, useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

interface ContextMenuProps {
  children: (openContextMenu: (e: React.MouseEvent) => void) => ReactNode;
  menuItems: {
    label: string;
    icon?: ReactNode;
    onClick: () => void;
    variant?: "default" | "destructive";
  }[];
}

export function ContextMenu({ children, menuItems }: ContextMenuProps) {
  const [visible, setVisible] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const menuRef = useRef<HTMLDivElement>(null);

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    setPosition({ x: e.clientX, y: e.clientY });
    setVisible(true);
  };

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setVisible(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleMenuItemClick = (onClick: () => void) => {
    onClick();
    setVisible(false);
  };

  return (
    <>
      {children(handleContextMenu)}
      {visible && (
        <div
          ref={menuRef}
          className="fixed z-50 bg-white rounded-md shadow-lg py-1 min-w-[160px] border border-gray-200"
          style={{
            left: `${position.x}px`,
            top: `${position.y}px`,
          }}
        >
          {menuItems.map((item, index) => (
            <button
              key={index}
              onClick={() => handleMenuItemClick(item.onClick)}
              className={cn(
                "w-full flex items-center px-4 py-2 text-sm hover:bg-gray-100 text-left",
                item.variant === "destructive" && "text-red-600 hover:bg-red-50"
              )}
            >
              {item.icon && <span className="mr-2">{item.icon}</span>}
              {item.label}
            </button>
          ))}
        </div>
      )}
    </>
  );
}