import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import * as solariumService from "@/server/solarium/solarium.service";
import { indexFolders } from "@/server/actions/folder-actions";

export const metadata = {
    title: "Configuración Solarium"
};

export async function getAuthedUserId(): Promise<string | null> {
	const session = await auth();
	return session?.user?.id ?? null;
}

export default async function sessionConfigPage() {
    const userId = await getAuthedUserId();
    if(!userId) redirect("/login");

    const selectMaterial =  await indexFolders();

    

}