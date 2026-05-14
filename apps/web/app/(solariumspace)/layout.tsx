import "@blocknote/mantine/style.css";

// Layout transparente del route group: existe para escapar del sidebar de
// (workspace) y dar a /active un modo distraction-free. No añade chrome propio.
export default function SolariumSpaceLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return <>{children}</>;
}
