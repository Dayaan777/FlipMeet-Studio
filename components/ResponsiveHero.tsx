import MobileStoryHero from "./MobileStoryHero";
import DesktopBannerHero from "./DesktopBannerHero";

export default function ResponsiveHero() {
  return (
    <>
      {/* Mobile hero: Story reels carousel */}
      <div className="block md:hidden">
        <MobileStoryHero />
      </div>

      {/* Laptop / PC hero: Campaign image banner */}
      <div className="hidden md:block">
        <DesktopBannerHero />
      </div>
    </>
  );
}
