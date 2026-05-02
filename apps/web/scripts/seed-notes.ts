import "dotenv/config";
import { PrismaClient } from "../generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const prisma = new PrismaClient({
	adapter: new PrismaPg({
		connectionString: process.env.DATABASE_URL,
	}),
});

async function main() {
	const user = await prisma.user.findFirst();
	if (!user) {
		console.error("No hay usuarios en la BD. Crea uno antes con login.");
		return;
	}

	const folders = await prisma.folder.findMany({
		where: { userId: user.id },
	});

	console.log(`Insertando notas para ${user.email}`);
	console.log(
		`Carpetas disponibles: ${folders.map((f) => f.name).join(", ") || "(ninguna)"}`,
	);

	const seedData: Array<{
		title: string;
		folderName: string | null;
		quick: boolean;
		daysAgo: number;
	}> = [
		{ title: "Apuntes clase de Álgebra", folderName: "Matemáticas", quick: false, daysAgo: 0 },
		{ title: "Receta tarta de queso", folderName: null, quick: true, daysAgo: 0 },
		{ title: "Ideas TFG", folderName: null, quick: false, daysAgo: 0 },
		{ title: "Bibliografía historia contemporánea", folderName: "Historia", quick: false, daysAgo: 1 },
		{ title: "Lista de la compra", folderName: null, quick: true, daysAgo: 1 },
		{ title: "Notas reunión equipo", folderName: "Trabajo", quick: false, daysAgo: 2 },
		{ title: "Vocabulario inglés", folderName: "Inglés", quick: false, daysAgo: 3 },
		{ title: "Pendientes de la semana", folderName: null, quick: true, daysAgo: 5 },
		{ title: "Receta pasta carbonara", folderName: null, quick: true, daysAgo: 7 },
		{ title: "Apuntes cálculo integral", folderName: "Matemáticas", quick: false, daysAgo: 10 },
	];

	for (const item of seedData) {
		const folderId = item.folderName
			? (folders.find((f) => f.name === item.folderName)?.id ?? null)
			: null;

		const date = new Date();
		date.setDate(date.getDate() - item.daysAgo);

		await prisma.note.create({
			data: {
				title: item.title,
				content: {},
				userId: user.id,
				folderId,
				isQuickNote: item.quick,
				createdAt: date,
				updatedAt: date,
			},
		});
	}

	console.log(`✓ Insertadas ${seedData.length} notas.`);
}

main()
	.catch((e) => {
		console.error(e);
		process.exit(1);
	})
	.finally(() => prisma.$disconnect());
