import { LandingNav } from "@/components/landing/nav";
import { LandingHero } from "@/components/landing/hero";
import { LandingFeatures } from "@/components/landing/features";
import { SolariumShowcase } from "@/components/landing/solarium-showcase";
import { LandingCta } from "@/components/landing/cta";
import { LandingFooter } from "@/components/landing/footer";

export const metadata = {
	title: "Lumma · Notas y estudio enfocado",
	description:
		"Editor de notas tipo Notion + Solarium, un modo de estudio sin distracciones donde el tiempo se siente.",
};

export default function LandingPage() {
	return (
		<div className="flex min-h-screen flex-col bg-background">
			<LandingNav />
			<main className="flex-1">
				<LandingHero />
				<LandingFeatures />
				<SolariumShowcase />
				<LandingCta />
			</main>
			<LandingFooter />
		</div>
	);
}
