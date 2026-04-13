import { auth } from "@/auth";

  export default async function HomePage() {
    const session = await auth();

    return (
      <p className="text-muted-foreground">
        Bienvenido, {session?.user?.name ?? "usuario"}
      </p>
    );
  }