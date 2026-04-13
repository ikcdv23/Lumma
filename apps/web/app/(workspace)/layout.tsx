  import { auth, signOut } from "@/auth";                                                    
  import { Home, LogOut, User } from "lucide-react";          
  import Link from "next/link";                             
  import {                                                                                   
    Sidebar,                                                                                 
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarInset,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarProvider,
    SidebarTrigger,
  } from "@/components/ui/sidebar";

 export default async function WorkspaceLayout({
    children,
  }: {
    children: React.ReactNode;
  }) {  
    const session = await auth();
    return (
      <SidebarProvider>
        <Sidebar variant="inset">
          <SidebarHeader>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton size="lg">
                  <span className="text-lg font-bold">Lumma</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarHeader>

          <SidebarContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                    <Link href="/home/">
                        <Home />
                        pagina 1
                    </Link>
                </SidebarMenuButton>    
                <SidebarMenuButton asChild>
                    <Link href="/home2/">
                        <Home />
                        pagina 2
                    </Link>
                </SidebarMenuButton>    
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarContent>

          <SidebarFooter>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton size="lg">
                  <User />
                  <div className="flex flex-col">
                    <span className="text-sm font-medium">
                      {session?.user?.name ?? "Usuario"}
                    </span>
                  </div>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <form
                  action={async () => {
                    "use server";
                    await signOut();
                  }}
                >
                  <SidebarMenuButton asChild>
                    <button type="submit">
                      <LogOut />
                      <span>Cerrar sesion</span>
                    </button>
                  </SidebarMenuButton>
                </form>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarFooter>
        </Sidebar>

        <SidebarInset>
          <header className="flex h-14 items-center gap-2 border-b px-4">
            <SidebarTrigger />
            <h1 className="text-sm font-medium">Inicio</h1>
          </header>
          <main className="flex flex-1 items-center justify-center">
            {children}
          </main>
        </SidebarInset>
      </SidebarProvider>
    );
  }