// import { client } from "@/sanity/lib/client";

// // 📌 🖼 Image Upload Function
// export async function uploadImage(file: File) {
//   try {
//     const asset = await client.assets.upload("image", file, {
//       contentType: file.type,
//       filename: file.name,
//     });

//     return asset._id; // Return the uploaded image ID
//   } catch (error) {
//     console.error("Error uploading image:", error);
//     throw error;
//   }
// }

// // 📌 ✏ Update Product Function
// export async function updateProduct(productId: string, updatedData: any) {
//   try {
//     await client.patch(productId).set(updatedData).commit();
//     return true;
//   } catch (error) {
//     console.error("Error updating product:", error);
//     throw error;
//   }
// }

// // 📌 ❌ Delete Product Function
// export async function deleteProduct(productId: string) {
//   try {
//     await client.delete(productId);
//     return true;
//   } catch (error) {
//     console.error("Error deleting product:", error);
//     throw error;
//   }
// }

import { client } from "@/sanity/lib/client";

// 📌 Image Upload Function
export async function uploadImage(file: File) {
  const asset = await client.assets.upload("image", file);
  return asset._id;
}

// 📌 Update Product Function
export async function updateProduct(productId: string, updatedData: any) {
  return await client.patch(productId).set(updatedData).commit();
}

// 📌 Delete Product Function
export async function deleteProduct(productId: string) {
  return await client.delete(productId);
}

// 📌 Add Product Function (Fix for Your Error)
export async function addProduct(productData: any) {
    const newProduct = await client.create({
      _type: "product",
      ...productData,
    });
  
    // 📌 Convert Image Reference to Full URL
    const imageUrl = newProduct.productImage?.asset?._ref
      ? `https://cdn.sanity.io/images/${client.config().projectId}/${client.config().dataset}/${newProduct.productImage.asset._ref.split("-")[1]}-${newProduct.productImage.asset._ref.split("-")[2]}.${newProduct.productImage.asset._ref.split("-")[3]}`
      : "";
  
    return {
      _id: newProduct._id,
      title: newProduct.title,
      description: newProduct.description,
      price: newProduct.price,
      imageUrl: imageUrl, // ✅ Now it returns a valid URL
    };
  }