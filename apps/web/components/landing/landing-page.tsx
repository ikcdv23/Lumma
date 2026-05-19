import { LandingNav } from "./nav";
import { LandingHero } from "./hero";
import { LandingFeatures } from "./features";
import { SolariumShowcase } from "./solarium-showcase";
import { SunSpotlight } from "./sun-spotlight";
import { LandingCta } from "./cta";
import { LandingFooter } from "./footer";

export function LandingPage() {
	return (
		<div className="flex min-h-screen flex-col bg-background">
			<LandingNav />
			<main className="flex-1">
				<LandingHero />
				<LandingFeatures />
				<SolariumShowcase />
				<SunSpotlight />
				<LandingCta />
			</main>
			<LandingFooter />
		</div>
	);
}
