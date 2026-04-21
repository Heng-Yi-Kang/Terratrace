import SearchBar from "./components/SearchBar"

const Hero = () => (
    <section className="min-h-screen flex items-center justify-center px-4 relative overflow-hidden">
        <div className="absolute top-20 left-10 w-64 h-64 bg-secondary/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-cyan-secondary/20 rounded-full blur-3xl"></div>

        <div className="w-full max-w-4xl mx-auto">
            <h1 className="font-heading font-bold text-3xl md:text-4xl lg:text-5xl text-center text-text">Let's find our</h1>
            <h1 className="font-heading font-bold text-4xl md:text-5xl lg:text-6xl text-center text-primary mt-2 mb-10">Next Destination.</h1>
            <SearchBar />
        </div>

    </section>
)

const CatalogSection = () => (
    <section className="py-20 px-4 bg-white/50">
        <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
                <h2 className="font-heading font-bold text-3xl md:text-4xl text-text mb-4">
                    All Eco Destinations
                </h2>
                <p className="text-text/70 max-w-2xl mx-auto">
                    Tourism contributes 8% of global carbon emissions. Every choice we make impacts our planet.
                </p>
            </div>
        </div>
    </section>
)

export default function EcoDirectoryPage() {
    return (
        <main className="min-h-screen">
            <Hero />
            <CatalogSection />
        </main>
    )
}