"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronsUpDown, Compass, LogOut, Plus } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Separator } from "@/components/ui/separator";
import { TooltipProvider } from "@/components/ui/tooltip";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarRail,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";
import {
  adminShell,
  currentItem,
  isActive,
  partnerShell,
  travelerShell,
  type ShellConfig,
} from "./nav-config";

export type ShellVariant = "traveler" | "partner" | "admin";

const configs: Record<ShellVariant, ShellConfig> = {
  traveler: travelerShell,
  partner: partnerShell,
  admin: adminShell,
};

interface ShellUser {
  email?: string;
}

interface AppShellProps {
  variant: ShellVariant;
  user?: ShellUser;
  children: ReactNode;
}

function initials(email?: string) {
  const name = email?.split("@")[0] ?? "";
  return (name.slice(0, 2) || "T").toUpperCase();
}

function SignOutItem() {
  return (
    <form action="/auth/signout" method="post">
      <DropdownMenuItem asChild>
        <button type="submit" className="w-full cursor-pointer">
          <LogOut aria-hidden="true" />
          Đăng xuất
        </button>
      </DropdownMenuItem>
    </form>
  );
}

function AccountMenu({ user }: { user?: ShellUser }) {
  const { isMobile } = useSidebar();
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <SidebarMenuButton size="lg" className="data-[state=open]:bg-sidebar-accent" aria-label="Menu tài khoản">
          <Avatar className="size-8 rounded-lg">
            <AvatarFallback className="rounded-lg text-xs">{initials(user?.email)}</AvatarFallback>
          </Avatar>
          <span className="grid flex-1 text-left text-sm leading-tight">
            <span className="truncate font-medium">{user?.email ?? "Tài khoản"}</span>
          </span>
          <ChevronsUpDown className="ml-auto size-4" aria-hidden="true" />
        </SidebarMenuButton>
      </DropdownMenuTrigger>
      <DropdownMenuContent side={isMobile ? "bottom" : "right"} align="end" className="min-w-56">
        <DropdownMenuLabel className="truncate font-normal text-muted-foreground">
          {user?.email ?? "Tài khoản"}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <SignOutItem />
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function AppSidebar({ config, user }: { config: ShellConfig; user?: ShellUser }) {
  const pathname = usePathname() || "";
  const { setOpenMobile } = useSidebar();

  return (
    <Sidebar collapsible="icon" aria-label={`Điều hướng ${config.area.toLowerCase()}`}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild tooltip="Tripz">
              <Link href="/" onClick={() => setOpenMobile(false)}>
                <span className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                  <Compass className="size-4" aria-hidden="true" />
                </span>
                <span className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold">Tripz</span>
                  <span className="truncate text-xs text-muted-foreground">{config.area}</span>
                </span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        {config.groups.map((group) => (
          <SidebarGroup key={group.label}>
            <SidebarGroupLabel>{group.label}</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {group.items.map((item) => (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton
                      asChild
                      tooltip={item.label}
                      isActive={isActive(pathname, item)}
                      className="min-h-11 md:min-h-8"
                    >
                      <Link
                        href={item.href}
                        aria-current={isActive(pathname, item) ? "page" : undefined}
                        onClick={() => setOpenMobile(false)}
                      >
                        <item.icon aria-hidden="true" />
                        <span>{item.label}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>

      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <AccountMenu user={user} />
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}

function ShellHeader({ config }: { config: ShellConfig }) {
  const pathname = usePathname() || "";
  const item = currentItem(pathname, config);

  return (
    <header className="flex h-14 shrink-0 items-center gap-2 border-b border-border px-4">
      <SidebarTrigger className="-ml-1 size-11 md:size-7" aria-label="Mở hoặc đóng điều hướng" />
      <Separator orientation="vertical" className="mr-2 h-4 self-center" />
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem className="hidden sm:inline-flex">{config.rootLabel}</BreadcrumbItem>
          <BreadcrumbSeparator className="hidden sm:block" />
          <BreadcrumbItem>
            <BreadcrumbPage>{item?.label ?? config.area}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
      {config.action && (
        <Button asChild size="sm" className="ml-auto min-h-11 md:min-h-8">
          <Link href={config.action.href}>
            <Plus aria-hidden="true" />
            {config.action.label}
          </Link>
        </Button>
      )}
    </header>
  );
}

/** One dashboard shell for traveler, partner and admin: labelled sidebar that collapses to icons, header with breadcrumb, skip link. */
export default function AppShell({ variant, user, children }: AppShellProps) {
  const config = configs[variant];

  return (
    <TooltipProvider>
    <SidebarProvider>
      <a href="#main-content" className="skip-link">Bỏ qua đến nội dung chính</a>
      <AppSidebar config={config} user={user} />
      <SidebarInset className="min-w-0">
        <ShellHeader config={config} />
        <main id="main-content" tabIndex={-1} className="flex min-h-0 flex-1 flex-col outline-none">
          {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
    </TooltipProvider>
  );
}
