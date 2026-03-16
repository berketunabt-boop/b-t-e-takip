import {
  LayoutDashboard,
  ArrowLeftRight,
  CreditCard,
  TrendingUp,
  Target,
} from "lucide-react";
import { useLocation, Link, useParams } from "react-router-dom";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
  useSidebar,
} from "@/components/ui/sidebar";
import { ThemeToggle } from "@/components/ThemeToggle";

const items = [
  { title: "Dashboard", url: "/", icon: LayoutDashboard },
  { title: "Gelir & Gider", url: "/transactions", icon: ArrowLeftRight },
  { title: "Kredi Kartları", url: "/credit-cards", icon: CreditCard },
  { title: "Yatırımlar", url: "/investments", icon: TrendingUp },
  { title: "Hedefler", url: "/goals", icon: Target },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const location = useLocation();
  const { budgetId } = useParams<{ budgetId: string }>();

  const getUrl = (path: string) => `/bütçe/${budgetId}${path === "/" ? "/dashboard" : path}`;

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="p-4">
        <Link to="/" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
            <span className="text-primary-foreground font-bold text-sm">₺</span>
          </div>
          {!collapsed && (
            <span className="font-semibold text-base tracking-tight text-sidebar-foreground">
              FinansApp
            </span>
          )}
        </Link>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Ana Menü</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => {
                const targetUrl = getUrl(item.url);
                const isActive = location.pathname === targetUrl;
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild isActive={isActive}>
                      <Link to={targetUrl}>
                        <item.icon className="h-4 w-4" />
                        {!collapsed && <span>{item.title}</span>}
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-4">
        <ThemeToggle />
      </SidebarFooter>
    </Sidebar>
  );
}
