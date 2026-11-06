import type { User } from "./user";

export interface NavItem {
  label: string;
  href: string;
}

export interface NavbarProps {
  user?: User | null;
  onLogout?: () => void | Promise<void>;
  className?: string;
}
