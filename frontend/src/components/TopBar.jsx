import { useEffect, useRef, useState } from "react";
import { LogoutIcon } from "./icons";

export default function TopBar({ title, subtitle, email, onLogout }) {
  const [open, setOpen] = useState(false);
  const menuRef = useRef(null);
  const initial = (email || "?").trim().charAt(0).toUpperCase();

  useEffect(() => {
    function handleClick(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  return (
    <header className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-white">
      <div>
        <h1 className="text-lg font-bold text-gray-800">{title}</h1>
        {subtitle && <p className="text-sm text-gray-400">{subtitle}</p>}
      </div>

      <div className="relative" ref={menuRef}>
        <button
          onClick={() => setOpen((o) => !o)}
          className="h-9 w-9 rounded-full bg-teal-600 text-white font-semibold flex items-center justify-center hover:bg-teal-700 transition"
          title={email}
        >
          {initial}
        </button>

        {open && (
          <div className="absolute right-0 mt-2 w-56 bg-white border border-gray-200 rounded-lg shadow-lg py-1 z-10">
            <div className="px-4 py-2 text-sm text-gray-700 truncate border-b border-gray-100">{email}</div>
            <button
              onClick={onLogout}
              className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50"
            >
              <LogoutIcon className="h-4 w-4" />
              Log out
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
