import { auth } from "@/auth";
import { HomeClient } from "./home-client";

export const metadata = {
    title: "Inicio",
};

export default async function HomePage() {
    const session = await auth();
    const userName = session?.user?.name ?? "tu";

    return <HomeClient userName={userName} />;
}
