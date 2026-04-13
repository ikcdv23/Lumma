import { auth } from "@/auth";

  export default async function HomePage() {
    const session = await auth();

    return (
      <p className="text-muted-foreground">
        bienbenido a la pagina 2, {session?.user?.name ?? "usuario"}
      </p>
    );
  }