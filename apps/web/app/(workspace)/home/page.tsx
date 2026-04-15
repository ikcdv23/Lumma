import { auth } from "@/auth";

export const metadata = {
    title: "Inicio", 
};

  export default async function HomePage() {
    const session = await auth();

    return (
      <p className="text-muted-foreground">
        Bienvenido a la pagina 1, {session?.user?.name ?? "usuario"}
      </p>
    );
  }