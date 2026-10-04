import type { AnchorHTMLAttributes, MouseEvent, ReactNode } from "react";
import { useHref, useLocation } from "react-router-dom";

type SiteLinkProps = Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "href"> & {
  to: string;
  children: ReactNode;
};

function useReliableNavigation(to: string, onClick?: (event: MouseEvent<HTMLAnchorElement>) => void) {
  const href = useHref(to);

  const handleClick = (event: MouseEvent<HTMLAnchorElement>) => {
    onClick?.(event);
    if (
      event.defaultPrevented ||
      event.button !== 0 ||
      event.metaKey ||
      event.ctrlKey ||
      event.shiftKey ||
      event.altKey
    ) return;

    const anchor = event.currentTarget;
    const target = anchor.getAttribute("target");
    if ((target && target !== "_self") || anchor.hasAttribute("download")) return;

    event.preventDefault();
    try {
      window.history.pushState(null, "", href);
      window.location.reload();
    } catch {
      window.location.assign(href);
    }
  };

  return { href, handleClick };
}

export function SiteLink({ to, children, onClick, ...props }: SiteLinkProps) {
  const { href, handleClick } = useReliableNavigation(to, onClick);
  return <a {...props} href={href} onClick={handleClick}>{children}</a>;
}

export function SiteNavLink({ to, children, className, onClick, ...props }: SiteLinkProps) {
  const { href, handleClick } = useReliableNavigation(to, onClick);
  const { pathname } = useLocation();
  const active = to === "/" ? pathname === "/" : pathname === to || pathname.startsWith(`${to}/`);
  const resolvedClassName = [className, active && "active"].filter(Boolean).join(" ") || undefined;

  return <a {...props} href={href} className={resolvedClassName} aria-current={active ? "page" : undefined} onClick={handleClick}>{children}</a>;
}
