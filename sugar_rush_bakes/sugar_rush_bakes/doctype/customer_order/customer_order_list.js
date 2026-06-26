frappe.listview_settings["Customer Order"] = {
	add_fields: ["customer_name", "grand_total", "order_status", "payment_status"],
	get_indicator: function (doc) {
		if (doc.order_status === "Delivered") {
			return [__("Delivered"), "green", "order_status,=,Delivered"];
		} else if (doc.order_status === "Cancelled") {
			return [__("Cancelled"), "red", "order_status,=,Cancelled"];
		} else if (doc.order_status === "Confirmed") {
			return [__("Confirmed"), "blue", "order_status,=,Confirmed"];
		} else if (doc.order_status === "In Preparation") {
			return [__("In Preparation"), "orange", "order_status,=,In Preparation"];
		} else if (doc.order_status === "Out for Delivery") {
			return [__("Out for Delivery"), "purple", "order_status,=,Out for Delivery"];
		} else if (doc.order_status === "Ready for Pickup") {
			return [__("Ready for Pickup"), "yellow", "order_status,=,Ready for Pickup"];
		} else if (doc.order_status === "Placed") {
			return [__("Placed"), "blue", "order_status,=,Placed"];
		} else {
			return [__("Draft"), "grey", "order_status,=,Draft"];
		}
	}
};
