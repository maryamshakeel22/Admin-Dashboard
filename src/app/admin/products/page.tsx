"use client";

import { useEffect, useState } from "react";
import { client } from "@/sanity/lib/client";
import { uploadImage, updateProduct, deleteProduct, addProduct } from "@/utils/sanity";
import Image from "next/image";
import Swal from "sweetalert2";
import { useRouter } from "next/navigation";

interface Product {
  _id: string;
  title: string;
  description: string;
  price: number;
  imageUrl: string;
}

export default function AdminProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [newImage, setNewImage] = useState<File | null>(null);
  const [newProduct, setNewProduct] = useState<{ title: string; description: string; price: string; image: File | null }>({
    title: "",
    description: "",
    price: "",
    image: null,
  });
  const router = useRouter();

  useEffect(() => {
    client
      .fetch(
        `*[_type == "product"]{
          _id, title, description, price,
          "imageUrl": productImage.asset->url
        }`
      )
      .then((data) => setProducts(data))
      .catch((error) => console.error("Error fetching products:", error));
  }, []);

  const handleSave = async () => {
    if (!editingProduct) return;

    let updatedData: any = {
      title: editingProduct.title,
      description: editingProduct.description,
      price: editingProduct.price,
    };

    if (newImage) {
      try {
        const imageId = await uploadImage(newImage);
        updatedData.productImage = { _type: "image", asset: { _ref: imageId } };
      } catch (error) {
        Swal.fire("Error!", "Image upload failed.", "error");
        return;
      }
    }

    try {
      await updateProduct(editingProduct._id, updatedData);
      Swal.fire("Success!", "Product updated successfully.", "success");

      setProducts((prev) =>
        prev.map((p) => (p._id === editingProduct._id ? { ...p, ...updatedData } : p))
      );

      setEditingProduct(null);
      setNewImage(null);
    } catch (error) {
      Swal.fire("Error!", "Something went wrong.", "error");
    }
  };

  const handleDelete = async (productId: string) => {
    const result = await Swal.fire({
      title: "Are you sure?",
      text: "This action cannot be undone!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, delete it!",
    });

    if (!result.isConfirmed) return;

    try {
      await deleteProduct(productId);
      setProducts((prev) => prev.filter((p) => p._id !== productId));
      Swal.fire("Deleted!", "Product has been deleted.", "success");
    } catch (error) {
      Swal.fire("Error!", "Failed to delete product.", "error");
    }
  };

  const handleAddProduct = async () => {
    if (!newProduct.title || !newProduct.description || !newProduct.price || !newProduct.image) {
      Swal.fire("Error!", "All fields are required!", "error");
      return;
    }

    let imageId = "";
    try {
      imageId = await uploadImage(newProduct.image);
    } catch (error) {
      Swal.fire("Error!", "Image upload failed.", "error");
      return;
    }

    const productData = {
      title: newProduct.title,
      description: newProduct.description,
      price: parseFloat(newProduct.price),
      productImage: { _type: "image", asset: { _ref: imageId } },
    };

    try {
      const newAddedProduct = await addProduct(productData);
      Swal.fire("Success!", "Product added successfully.", "success");
      setProducts([...products, newAddedProduct]);
      setNewProduct({ title: "", description: "", price: "", image: null });
    } catch (error) {
      Swal.fire("Error!", "Failed to add product.", "error");
    }
  };

  return (
    <div className="flex h-screen bg-black text-white">
      {/* Sidebar */}
      <div className="w-64 bg-gray-900 p-6">
        <h2 className="text-3xl font-bold mb-6 text-center">Admin Panel</h2>
        <div className="space-y-4">
          <button
            className="w-full py-2 px-4 rounded-lg bg-gray-700 hover:bg-gray-600"
            onClick={() => router.push("/admin/dashboard")}
          >
            Orders
          </button>
          <button
            className="w-full py-2 px-4 rounded-lg bg-white text-black font-bold"
            onClick={() => router.push("/admin/products")}
          >
            Products
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-8 overflow-y-auto">
        <h2 className="text-3xl font-semibold mb-6 text-center">Manage Products</h2>

        {/* Add Product Section */}
        <div className="border p-4 rounded-lg bg-gray-800 shadow mb-6">
          <h3 className="text-lg font-bold mb-2">Add New Product</h3>
          <input
            type="text"
            className="w-full p-2 border rounded-lg mb-2 text-black"
            placeholder="Product Title"
            value={newProduct.title}
            onChange={(e) => setNewProduct({ ...newProduct, title: e.target.value })}
          />
          <textarea
            className="w-full p-2 border rounded-lg mb-2 text-black"
            placeholder="Product Description"
            value={newProduct.description}
            onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })}
          />
          <input
            type="number"
            className="w-full p-2 border rounded-lg mb-2 text-black"
            placeholder="Price"
            value={newProduct.price}
            onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })}
          />
          <input
            type="file"
            className="mb-2"
            onChange={(e) => setNewProduct({ ...newProduct, image: e.target.files ? e.target.files[0] : null })}
          />
          <button onClick={handleAddProduct} className="bg-green-500 text-white px-3 py-1 rounded-lg">
            Add Product
          </button>
        </div>

        {/* Products Table */}
        <div className="overflow-x-auto">
          <table className="w-full bg-gray-900 text-white border">
            <thead className="bg-gray-700">
              <tr>
                <th>Image</th>
                <th>Title</th>
                <th>Description</th>
                <th>Price</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map((product) => (
                <tr key={product._id} className="border-t">
                  <td className="p-4 w-20 h-20">
                  <Image
                        src={product.imageUrl}
                        width={60}
                        height={60}
                        alt={product.title}
                        className="w-16 h-12 object-cover rounded-lg"
                        loading='lazy'
                      />
                  </td>
                  <td>{product.title}</td>
                  <td>{product.description.slice(0, 20)}</td>
                  <td>${product.price}</td>
                  <td>
                    <button onClick={() => setEditingProduct(product)} className="bg-blue-500 px-3 py-1 rounded-lg">
                      Edit
                    </button>
                    <button onClick={() => handleDelete(product._id)} className="bg-red-500 px-3 py-1 rounded-lg ml-2">
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      {editingProduct && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
          <div className="bg-white text-black p-6 rounded-lg w-96">
            <h3 className="text-lg font-bold mb-4">Edit Product</h3>
            <input
              type="text"
              className="w-full p-2 border rounded-lg mb-2"
              value={editingProduct.title}
              onChange={(e) =>
                setEditingProduct((prev) => prev && { ...prev, title: e.target.value })
              }
            />
                   <textarea
        className="w-full p-2 border rounded-lg mb-2"
        value={editingProduct.description}
        onChange={(e) =>
          setEditingProduct((prev) => prev && { ...prev, description: e.target.value })
        }
      />
      <input
        type="number"
        className="w-full p-2 border rounded-lg mb-2"
        value={editingProduct.price}
        onChange={(e) =>
          setEditingProduct((prev) => prev && { ...prev, price: parseFloat(e.target.value) })
        }
      />
      <input
        type="file"
        className="mb-2"
        onChange={(e) => setNewImage(e.target.files ? e.target.files[0] : null)}
      />

            <div className="flex justify-between">
              <button onClick={() => setEditingProduct(null)} className="bg-gray-400 text-white px-3 py-1 rounded-lg">
                Cancel
              </button>
              <button onClick={handleSave} className="bg-green-500 text-white px-3 py-1 rounded-lg">
                Save
              </button>
            </div>
          </div>
        </div>
      )}
  </div>
  );
}