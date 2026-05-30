"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/utils/supabase/client";
import { api } from "@/utils/api";

interface OrderItem {
  listingId: string;
  cropName: string;
  price: number;
  quantity: number;
  unit: string;
  farmerId: string;
}

interface Order {
  _id: string;
  buyerId: any;
  items: OrderItem[];
  totalAmount: number;
  paymentMethod: string;
  paymentStatus: string;
  status: string;
  createdAt: string;
}

export default function OrderSystem() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    checkUserContext();
  }, []);

  const checkUserContext = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.user) {
      setUserId(session.user.id);
      const role = session.user.user_metadata?.role || "buyer";
      setUserRole(role);
      fetchOrders(role);
    } else {
      setLoading(false);
    }
  };

  const fetchOrders = async (role: string) => {
    setLoading(true);
    try {
      let endpoint = '/orders/buyer';
      if (role === 'admin') endpoint = '/orders/admin/all';
      else if (role === 'farmer') endpoint = '/orders/farmer';

      const data = await api.get(endpoint);
      setOrders(data.orders || []);
    } catch (error) {
      console.error("Error fetching orders:", error);
    } finally {
      setLoading(false);
    }
  };

  // Mock function to simulate a purchase happening from the UI via Express API
  const handleTestPurchase = async () => {
    if (!userId) return alert("Must be logged in to test purchase");

    try {
      await api.post('/orders', {
        items: [
          {
            listingId: "65f123456789012345678901", // Placeholder
            cropName: "Test Crop",
            price: 100,
            quantity: 2,
            unit: "kg",
            farmerId: "65f123456789012345678902" // Placeholder
          }
        ],
        totalAmount: 200,
        paymentMethod: "Cash on Delivery",
        shippingAddress: "123 Test Street, Mumbai"
      });
      alert("Order placed successfully via Express API!");
      fetchOrders(userRole || 'buyer');
    } catch (error: any) {
      alert("Purchase error: " + error.message);
    }
  };

  if (!userId) {
    return <div className="p-4 text-center text-gray-500">Please log in to view orders.</div>;
  }

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-xl shadow-md min-h-screen border mt-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">
          {userRole === 'admin' ? "System Orders (Admin)" : userRole === 'farmer' ? "Received Orders (Farmer)" : "Your Orders"}
        </h2>
        
        {userRole === 'buyer' && (
          <button 
            onClick={handleTestPurchase}
            className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded shadow transition"
          >
            Simulate Purchase (Express)
          </button>
        )}
      </div>

      {loading ? (
        <p className="text-gray-500 text-center py-4">Loading Express orders...</p>
      ) : orders.length === 0 ? (
        <p className="text-gray-500 text-center py-4">No orders found.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white rounded-lg overflow-hidden border">
            <thead className="bg-gray-100 text-gray-600 text-left">
              <tr>
                <th className="py-3 px-4 uppercase font-semibold text-sm">Order ID</th>
                <th className="py-3 px-4 uppercase font-semibold text-sm">Items</th>
                <th className="py-3 px-4 uppercase font-semibold text-sm">Amount</th>
                <th className="py-3 px-4 uppercase font-semibold text-sm">Status</th>
                <th className="py-3 px-4 uppercase font-semibold text-sm">Date</th>
              </tr>
            </thead>
            <tbody className="text-gray-700 divide-y">
              {orders.map((order) => (
                <tr key={order._id} className="hover:bg-gray-50 transition">
                  <td className="py-3 px-4 text-xs font-mono">#{order._id.substring(order._id.length - 8)}</td>
                  <td className="py-3 px-4 text-sm">
                    {order.items.map(item => `${item.cropName} (${item.quantity}${item.unit})`).join(', ')}
                  </td>
                  <td className="py-3 px-4 font-bold">₹{order.totalAmount}</td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-1 rounded text-xs font-bold uppercase ${
                      order.status === 'pending' ? 'bg-orange-100 text-orange-800' : 
                      order.status === 'delivered' ? 'bg-green-100 text-green-800' :
                      order.status === 'rejected' ? 'bg-red-100 text-red-800' :
                      'bg-blue-100 text-blue-800'
                    }`}>
                      {order.status}
                    </span>
                    <div className="text-[10px] text-gray-400 mt-1 uppercase">{order.paymentStatus} via {order.paymentMethod}</div>
                  </td>
                  <td className="py-3 px-4 text-sm">{new Date(order.createdAt).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
