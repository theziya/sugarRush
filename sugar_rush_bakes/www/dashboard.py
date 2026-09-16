import frappe
from frappe.utils import flt, today


def get_context(context):
	context.no_cache = 1
	context.title = "Sugar Rush Dashboard"
	context.metrics = get_metrics()
	context.links = get_dashboard_links()
	context.recent_orders = frappe.get_all(
		"Customer Order",
		fields=["name", "customer_name", "order_status", "payment_status", "grand_total", "delivery_date"],
		order_by="creation desc",
		limit=8,
	)
	context.custom_requests = frappe.get_all(
		"Custom Cake Request",
		fields=["name", "customer_name", "status", "priority", "delivery_date", "quoted_price"],
		order_by="creation desc",
		limit=8,
	)
	context.payment_logs = frappe.get_all(
		"Payment Transaction",
		fields=["name", "customer_order", "transaction_type", "status", "amount", "payment_gateway"],
		order_by="creation desc",
		limit=6,
	)


def get_metrics():
	current_date = today()
	day_start = f"{current_date} 00:00:00"
	day_end = f"{current_date} 23:59:59"
	orders_today = frappe.db.count(
		"Customer Order",
		{"order_date": ["between", [day_start, day_end]], "order_status": ["!=", "Cancelled"]},
	)
	pending_orders = frappe.db.count(
		"Customer Order",
		{"order_status": ["not in", ["Delivered", "Cancelled"]]},
	)
	pending_custom = frappe.db.count(
		"Custom Cake Request",
		{"status": ["not in", ["Converted to Order", "Rejected", "Closed"]]},
	)
	revenue_today = frappe.db.get_value(
		"Customer Order",
		{"order_date": ["between", [day_start, day_end]], "order_status": ["!=", "Cancelled"]},
		"sum(grand_total)",
	) or 0
	failed_whatsapp = frappe.db.count("WhatsApp Message Log", {"status": "Failed"})
	failed_payments = frappe.db.count("Payment Transaction", {"status": "Failed"})

	return [
		{"label": "Orders Today", "value": orders_today, "route": "/app/customer-order"},
		{"label": "Pending Orders", "value": pending_orders, "route": "/app/customer-order"},
		{"label": "Pending Custom Cake Requests", "value": pending_custom, "route": "/app/custom-cake-request"},
		{
			"label": "Revenue Today",
			"value": frappe.format_value(flt(revenue_today), {"fieldtype": "Currency", "options": "INR"}),
			"route": "/app/customer-order",
		},
		{"label": "Failed WhatsApp Logs", "value": failed_whatsapp, "route": "/app/whatsapp-message-log"},
		{"label": "Failed Payments", "value": failed_payments, "route": "/app/payment-transaction"},
	]


def get_dashboard_links():
	return [
		{"label": "Customer Order", "route": "/app/customer-order", "group": "Operations"},
		{"label": "Custom Cake Request", "route": "/app/custom-cake-request", "group": "Operations"},
		{"label": "Payment Transaction", "route": "/app/payment-transaction", "group": "Operations"},
		{"label": "WhatsApp Message Log", "route": "/app/whatsapp-message-log", "group": "Operations"},
		{"label": "SRB Customer", "route": "/app/srb-customer", "group": "Customers"},
		{"label": "Product", "route": "/app/product", "group": "Catalog"},
		{"label": "Product Category", "route": "/app/product-category", "group": "Catalog"},
		{"label": "Coupon", "route": "/app/coupon", "group": "Catalog"},
		{"label": "Delivery Slot", "route": "/app/delivery-slot", "group": "Delivery"},
		{"label": "Serviceable Area", "route": "/app/serviceable-area", "group": "Delivery"},
		{"label": "Bakery Settings", "route": "/app/bakery-settings", "group": "Admin"},
		{"label": "Reports", "route": "/app/report", "group": "Admin"},
	]
