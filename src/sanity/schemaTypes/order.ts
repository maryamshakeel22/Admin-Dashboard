const OrderSchema = {
    name: "order",
    type: "document",
    title: "Order",
    fields: [
      {
        name: "firstName",
        title: "First Name",
        type: "string",
      },
      {
        name: "lastName",
        title: "Last Name",
        type: "string",
      },
      {
        name: "company",
        title: "Company",
        type: "string",
      },
      {
        name: "country",
        title: "Country",
        type: "string",
      },
      {
        name: "street",
        title: "Street",
        type: "string",
      },
      {
        name: "city",
        title: "City",
        type: "string",
      },
      {
        name: "province",
        title: "Province",
        type: "string",
      },
      {
        name: "zip",
        title: "Zip",
        type: "string",
      },
      {
        name: "phone",
        title: "Phone No",
        type: "string",
      },
      {
        name: "email",
        title: "Email",
        type: "string",
      },
      {
        name: "cart",
        title: "Cart Items",
        type: "array",
        of: [{ type: "reference", to: [{ type: "product"}]}]
      },
      {
        name: "total",
        title: "Total",
        type: "number",
      },
      {
        name: "status",
        title: "Order Status",
        type: "string",
        options: {
          list: [
            { title: "Pending", value: "pending" },
            { title: "Success", value: "success" },
            { title: "Dispatch", value: "dispatch" },
          ],
          layout: "radio",
        },
        initialValue: "pending",
      },
      {
        name: "orderDate",
        title: "Order Date",
        type: "datetime",
        options: {
          dateFormat: "YYYY-MM-DD",
          timeFormat: "HH:mm",
          calendarTodayLabel: "Today",
        },
        initialValue: new Date().toISOString(), // Automatically set current date
      },
    ],
  };
  
  export default OrderSchema;