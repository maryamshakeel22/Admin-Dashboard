"use client";

import React, { useEffect, useState } from "react";
import { client } from "@/sanity/lib/client";
import Image from "next/image";
import { useRouter } from "next/navigation";
import Swal from "sweetalert2";
import ProtectedRoute from "@/app/components/ProtectedRoute";

interface Order {
  _id: string;
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  street: string;
  province: string;
  city: string;
  zip: string;
  country: string;
  total: number;
  orderDate: string;
  status: string | null;
  cart: {
    imageUrl: string;
    title: string;
  }[];
}

export default function AdminDashboard() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [filter, setFilter] = useState("All");
  const router = useRouter();

  useEffect(() => {
    client
      .fetch(
        `*[_type == "order"]{
          _id,
          firstName,
          lastName,
          email,
          phone,
          street,
          city,
          province,
          zip,
          country,
          orderDate,
          status,
          total,
          cart[]->{
            _id,
            title,
            "imageUrl": productImage.asset->url,
          }
        }`
      )
      .then((data) => setOrders(data))
      .catch((error) => console.error("Error fetching orders:", error));
  }, []);

  const filteredOrders =
    filter === "All" ? orders : orders.filter((order) => order.status === filter);

  const toggleOrderDetails = (orderId: string) => {
    setSelectedOrderId((prev) => (prev === orderId ? null : orderId));
  };

  const handleDelete = async (orderId: string) => {
    const result = await Swal.fire({
      title: "Are you sure?",
      text: "This action cannot be undone!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete it!",
    });

    if (!result.isConfirmed) return;

    try {
      await client.delete(orderId);
      setOrders((prevOrders) => prevOrders.filter((order) => order._id !== orderId));
      Swal.fire("Deleted!", "The order has been removed.", "success");
    } catch (error) {
      console.error("Error deleting order:", error);
      Swal.fire("Error!", "Something went wrong while deleting.", "error");
    }
  };

  const handleStatusChange = async (orderId: string, newStatus: string) => {
    try {
      await client.patch(orderId).set({ status: newStatus }).commit();

      setOrders((prevOrders) =>
        prevOrders.map((order) =>
          order._id === orderId ? { ...order, status: newStatus } : order
        )
      );

      Swal.fire(`"Updated!", Order marked as ${newStatus}., "success"`);
    } catch (error) {
      console.error("Error updating order status:", error);
      Swal.fire("Error!", "Could not update order status.", "error");
    }
  };

  return (
    <ProtectedRoute>
      <div className="flex h-screen bg-white text-black">
        {/* Side Navbar */}
        <div className="w-64 bg-gray-900 p-6 shadow-lg">
          <h2 className="text-3xl font-bold mb-6 text-white">Admin Dashboard</h2>
          <div className="space-y-4">
            {["All", "pending", "dispatch", "success"].map((status) => (
              <button
                key={status}
                className={`block w-full text-left py-2 px-4 rounded-lg transition-all ${
                  filter === status ? "bg-white text-black font-bold" : "text-white hover:bg-gray-700"
                }`}
                onClick={() => setFilter(status)}
              >
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </button>
            ))}
            {/* Navigate to Products Page */}
            <button
              className="block w-full text-left py-2 px-4 rounded-lg transition-all text-white hover:bg-gray-700"
              onClick={() => router.push("/admin/products")}
            >
              Products
            </button>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 p-8 overflow-y-auto">
          <h2 className="text-3xl font-semibold mb-6 text-center">Orders</h2>
          <div className="overflow-x-auto bg-gray-900 text-white shadow-md rounded-lg">
            <table className="min-w-full divide-y divide-gray-700 text-sm lg:text-base">
              <thead className="bg-gray-800">
                <tr>
                  <th className="px-4 py-2">ID</th>
                  <th className="px-4 py-2">Customer</th>
                  <th className="px-4 py-2">Address</th>
                  <th className="px-4 py-2">Date</th>
                  <th className="px-4 py-2">Total</th>
                  <th className="px-4 py-2">Status</th>
                  <th className="px-4 py-2">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700">
                {filteredOrders.map((order) => (
                  <React.Fragment key={order._id}>
                    <tr
                      className="cursor-pointer hover:bg-gray-800 transition-all"
                      onClick={() => toggleOrderDetails(order._id)}
                    >
                      <td className="px-4 py-2">{order._id}</td>
                      <td className="px-4 py-2">{order.firstName} {order.lastName}</td>
                      <td className="px-4 py-2">{order.city}, {order.province}</td>
                      <td className="px-4 py-2">{new Date(order.orderDate).toLocaleDateString()}</td>
                      <td className="px-4 py-2">${order.total}</td>
                      <td className="px-4 py-2">
                        <select
                          value={order.status || ""}
                          onChange={(e) => handleStatusChange(order._id, e.target.value)}
                          className="bg-gray-700 p-1 rounded-lg w-full text-white"
                        >
                          <option value="pending">Pending</option>
                          <option value="dispatch">Dispatch</option>
                          <option value="success">Completed</option>
                        </select>
                      </td>
                      <td className="px-6 py-4">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDelete(order._id);
                          }}
                          className="bg-red-500 text-white px-3 py-1 rounded-lg hover:bg-red-700 transition-all"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                    {selectedOrderId === order._id && (
                      <tr>
                        <td colSpan={7} className="bg-gray-800 p-4">
                          <h3 className="font-bold">Order Details</h3>
                          <p><strong>Phone:</strong> {order.phone}</p>
                          <p><strong>Email:</strong> {order.email}</p>
                          <p><strong>Address:</strong> {order.street}, {order.city}, {order.province}, {order.zip}, {order.country}</p>
                          <ul>
                            {order.cart.map((product, index) => (
                              <li key={`${order._id}-${index}`} className="flex items-center gap-2">
                                {product.title}
                                <Image src={product.imageUrl} alt={product.title} width={50} height={50} className="w-16 h-16 object-cover" />
                              </li>
                            ))}
                          </ul>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}