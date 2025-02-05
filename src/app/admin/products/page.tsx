"use client";

import { useEffect, useState } from "react";
import { client } from "@/sanity/lib/client";
import { uploadImage, updateProduct, deleteProduct, addProduct } from "@/utils/sanity";
import Image from "next/image";
import Swal from "sweetalert2";

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
  const [newProduct, setNewProduct] = useState<{ title: string; description: string; price: string; image: File | null }>({ title: "", description: "", price: "", image: null });

  // 📌 Fetch Products from Sanity
  useEffect(() => {
    client
      .fetch(
        `*[_type == "product"]{
          _id,
          title,
          description,
          price,
          "imageUrl": productImage.asset->url
        }`
      )
      .then((data) => setProducts(data))
      .catch((error) => console.error("Error fetching products:", error));
  }, []);

  // 📌 Handle Image Upload & Product Update
  const handleSave = async () => {
    if (!editingProduct) return;
  
    let updatedData: any = {
      title: editingProduct.title,
      description: editingProduct.description,  // ✅ Ensure description is updated
      price: editingProduct.price,              // ✅ Ensure price is updated
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
  
  

  // 📌 Handle Delete Product
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

  // 📌 Handle Add Product
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
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4 text-center">Manage Products</h2>

      {/* 🔹 Add Product Form */}
      <div className="border p-4 rounded-lg bg-white shadow mb-6">
        <h3 className="text-lg font-bold mb-2">Add New Product</h3>
        <input
          type="text"
          className="w-full p-2 border rounded-lg mb-2"
          placeholder="Product Title"
          value={newProduct.title}
          onChange={(e) => setNewProduct({ ...newProduct, title: e.target.value })}
        />
        <textarea
          className="w-full p-2 border rounded-lg mb-2"
          placeholder="Product Description"
          value={newProduct.description}
          onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })}
        />
        <input
          type="number"
          className="w-full p-2 border rounded-lg mb-2"
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

      {/* 🔹 Existing Products */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {products.map((product) => (
          <div key={product._id} className="border p-4 rounded-lg bg-white shadow">
            <Image src={product.imageUrl} alt={product.title} width={200} height={200} className="mx-auto"/>
            <h3 className="text-lg font-bold mt-2">{product.title}</h3>
            <p className="text-gray-600">{product.description}</p>
            <p className="text-red-600 font-bold">${product.price}</p>
            <div className="mt-4 flex gap-2">
              <button
                onClick={() => setEditingProduct({...product})}
                className="bg-blue-500 text-white px-3 py-1 rounded-lg hover:bg-blue-700"
              >
                Edit
              </button>
              <button
                onClick={() => handleDelete(product._id)}
                className="bg-red-500 text-white px-3 py-1 rounded-lg hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      {editingProduct && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
          <div className="bg-white p-6 rounded-lg w-96">
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