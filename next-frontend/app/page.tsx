import Auth from "./components/Auth";
import ProductList from "./components/ProductList";
import OrderSystem from "./components/OrderSystem";
import Messages from "./components/Messages";

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-100 p-8 font-sans">
      <header className="max-w-6xl mx-auto mb-10 pb-4 border-b border-gray-300">
        <h1 className="text-4xl font-extrabold text-blue-900 tracking-tight">Supabase Dashboard Engine</h1>
        <p className="text-gray-600 mt-2">Manage Auth, E-commerce Logistics, and Customer Support in one unified interface.</p>
      </header>

      <main className="max-w-6xl mx-auto space-y-12">
        {/* Authentication Section */}
        <section id="auth">
          <Auth />
        </section>

        {/* E-Commerce Operations */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <section id="products">
            <ProductList />
          </section>

          <section id="orders">
            <OrderSystem />
          </section>
        </div>

        {/* Customer Service Section */}
        <section id="messages">
          <Messages />
        </section>
      </main>

      <footer className="max-w-6xl mx-auto mt-16 pt-8 border-t border-gray-300 text-center text-gray-500 text-sm">
        <p>Built with Supabase & Next.js App Router</p>
      </footer>
    </div>
  );
}
