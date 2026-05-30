"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/utils/supabase/client";
import { api } from "@/utils/api";

// Matches our Express 'listings' schema
interface Product {
  _id: string; // MongoDB uses _id
  cropName: string;
  description: string;
  price: number;
  quantity: number;
  unit: string;
  location: string;
  image: string;
  status: string;
  farmerId?: {
    name: string;
    phone: string;
    location: string;
  };
}

const IMG_BASE_URL = 'http://127.0.0.1:5001';

export default function ProductList() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isEditing, setIsEditing] = useState<string | null>(null); // Product ID being edited

  // Form states
  const [cropName, setCropName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [quantity, setQuantity] = useState("");
  const [unit, setUnit] = useState("kg");
  const [location, setLocation] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imageUrl, setImageUrl] = useState(""); // For showing existing image

  useEffect(() => {
    fetchProducts();
    checkAdminRole();
  }, []);

  const checkAdminRole = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    // For now, keeping Supabase for role check, but Express could also handle this
    if (session?.user?.user_metadata?.role === "admin" || session?.user?.user_metadata?.role === "farmer") {
      setIsAdmin(true);
    }
  };

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const data = await api.get('/listings');
      setProducts(data.listings || []);
    } catch (error) {
      console.error("Error fetching products:", error);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setCropName("");
    setDescription("");
    setPrice("");
    setQuantity("");
    setUnit("kg");
    setLocation("");
    setImageFile(null);
    setImageUrl("");
    setIsEditing(null);
  };

  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAdmin) return;

    const formData = new FormData();
    formData.append('cropName', cropName);
    formData.append('description', description);
    formData.append('price', price);
    formData.append('quantity', quantity);
    formData.append('unit', unit);
    formData.append('location', location);
    if (imageFile) formData.append('image', imageFile);

    try {
      await api.post('/listings', formData);
      resetForm();
      fetchProducts();
    } catch (error: any) {
      alert("Error adding product: " + error.message);
    }
  };

  const handleUpdateProduct = async (e: React.FormEvent, id: string) => {
    e.preventDefault();
    if (!isAdmin) return;

    const formData = new FormData();
    formData.append('cropName', cropName);
    formData.append('description', description);
    formData.append('price', price);
    formData.append('quantity', quantity);
    formData.append('unit', unit);
    formData.append('location', location);
    if (imageFile) formData.append('image', imageFile);

    try {
      await api.put(`/listings/${id}`, formData);
      resetForm();
      fetchProducts();
    } catch (error: any) {
      alert("Error updating product: " + error.message);
    }
  };

  const handleDeleteProduct = async (id: string) => {
    if (!isAdmin || !window.confirm("Are you sure you want to delete this product?")) return;

    try {
      await api.delete(`/listings/${id}`);
      fetchProducts();
    } catch (error: any) {
      alert("Error deleting product: " + error.message);
    }
  };

  const startEdit = (product: Product) => {
    setIsEditing(product._id);
    setCropName(product.cropName);
    setDescription(product.description || "");
    setPrice(product.price.toString());
    setQuantity(product.quantity.toString());
    setUnit(product.unit || "kg");
    setLocation(product.location || "");
    setImageUrl(product.image || "");
  };

  const getImageUrl = (path: string) => {
    if (!path) return 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=400&h=200&fit=crop';
    if (path.startsWith('http')) return path;
    return `${IMG_BASE_URL}${path}`;
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-gray-50 rounded-xl shadow-md min-h-screen">
      <h2 className="text-3xl font-extrabold text-gray-900 mb-6 border-b pb-4">Express Catalog</h2>

      {/* Admin/Farmer specific form */}
      {isAdmin && (
        <div className="bg-white p-6 rounded-lg shadow-sm border mb-8">
          <h3 className="text-lg font-bold mb-4">{isEditing ? "Edit Listing" : "Add New Listing"}</h3>
          <form onSubmit={(e) => isEditing ? handleUpdateProduct(e, isEditing) : handleAddProduct(e)} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input type="text" placeholder="Crop Name" value={cropName} onChange={(e) => setCropName(e.target.value)} required className="border rounded p-2 focus:ring-2 focus:ring-blue-500 outline-none" />
            <div className="flex gap-2">
              <input type="number" placeholder="Price" value={price} onChange={(e) => setPrice(e.target.value)} required min="0" className="border rounded p-2 focus:ring-2 focus:ring-blue-500 outline-none flex-1" />
              <input type="text" placeholder="Unit (kg, ton...)" value={unit} onChange={(e) => setUnit(e.target.value)} required className="border rounded p-2 focus:ring-2 focus:ring-blue-500 outline-none w-24" />
            </div>
            <input type="number" placeholder="Quantity" value={quantity} onChange={(e) => setQuantity(e.target.value)} required className="border rounded p-2 focus:ring-2 focus:ring-blue-500 outline-none" />
            <input type="text" placeholder="Location" value={location} onChange={(e) => setLocation(e.target.value)} required className="border rounded p-2 focus:ring-2 focus:ring-blue-500 outline-none" />
            
            <div className="md:col-span-2">
              <label className="block text-sm text-gray-600 mb-1">Product Image</label>
              <input type="file" onChange={(e) => setImageFile(e.target.files?.[0] || null)} className="border rounded p-2 w-full text-sm" accept="image/*" />
              {imageUrl && !imageFile && <p className="text-xs text-gray-500 mt-1">Current: {imageUrl}</p>}
            </div>

            <textarea placeholder="Description" value={description} onChange={(e) => setDescription(e.target.value)} rows={3} className="border rounded p-2 focus:ring-2 focus:ring-blue-500 outline-none md:col-span-2"></textarea>
            
            <div className="md:col-span-2 flex justify-end gap-3 mt-2">
              {isEditing && (
                <button type="button" onClick={resetForm} className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 transition">Cancel</button>
              )}
              <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition shadow">
                {isEditing ? "Update Listing" : "Save Listing"}
              </button>
            </div>
          </form>
        </div>
      )}

      {loading ? (
        <p className="text-center text-gray-500 animate-pulse py-10">Loading catalog from Express...</p>
      ) : products.length === 0 ? (
        <p className="text-center text-gray-500 py-10">No listings found in Express backend.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map((product) => (
            <div key={product._id} className="bg-white border rounded-lg overflow-hidden shadow hover:shadow-lg transition-shadow duration-300 flex flex-col">
              <img src={getImageUrl(product.image)} alt={product.cropName} className="h-48 w-full object-cover" />
              <div className="p-4 flex flex-col flex-grow">
                <div className="flex justify-between items-start mb-2">
                  <h4 className="text-xl font-bold text-gray-800">{product.cropName}</h4>
                  <span className="bg-green-100 text-green-800 text-sm font-bold px-2 py-1 rounded">₹{product.price}/{product.unit}</span>
                </div>
                <p className="text-gray-500 text-xs mb-1">📍 {product.location}</p>
                <p className="text-gray-600 text-sm flex-grow mb-4 line-clamp-2">{product.description}</p>
                <div className="text-sm font-semibold mb-4">Stock: {product.quantity} {product.unit}</div>
                
                {isAdmin && (
                  <div className="flex gap-2 pt-4 border-t mt-auto">
                    <button onClick={() => startEdit(product)} className="flex-1 bg-yellow-100 hover:bg-yellow-200 text-yellow-800 py-1 px-2 rounded text-sm font-medium transition">Edit</button>
                    <button onClick={() => handleDeleteProduct(product._id)} className="flex-1 bg-red-100 hover:bg-red-200 text-red-800 py-1 px-2 rounded text-sm font-medium transition">Delete</button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
