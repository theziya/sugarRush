import frappe
from frappe.utils import flt, today


def get_context(context):
	context.no_cache = 1
	context.title = "Sugar Rush Bakes"

	settings = get_bakery_settings()
	context.settings = settings
	context.categories = get_categories()
	context.featured_products = get_featured_products()
	context.offers = get_offers()
	context.stats = get_public_stats()
	context.support_whatsapp = settings.get("support_whatsapp_number") or settings.get("support_mobile")


def get_bakery_settings():
	if not frappe.db.exists("DocType", "Bakery Settings"):
		return {}

	settings = frappe.get_cached_doc("Bakery Settings")
	fields = [
		"bakery_name",
		"support_mobile",
		"support_whatsapp_number",
		"support_email",
		"instagram_url",
		"business_address",
		"default_min_advance_hours",
		"default_delivery_charge",
		"free_delivery_above",
	]
	return {field: settings.get(field) for field in fields}


def get_categories():
	return frappe.get_all(
		"Product Category",
		fields=["name", "category_name", "slug", "category_image", "description"],
		filters={"is_active": 1, "show_on_homepage": 1},
		order_by="display_order asc, category_name asc",
		limit=8,
	)


def get_featured_products():
	return frappe.get_all(
		"Product",
		fields=[
			"name",
			"product_name",
			"slug",
			"short_description",
			"starting_price",
			"offer_price",
			"show_price",
			"thumbnail_image",
			"main_image",
			"product_badge",
			"is_best_seller",
			"is_customizable",
		],
		filters={"is_active": 1, "available_for_website": 1, "is_featured": 1},
		order_by="display_order asc, product_name asc",
		limit=8,
	)


def get_offers():
	return frappe.get_all(
		"Coupon",
		fields=["coupon_code", "description", "discount_type", "discount_value", "valid_to"],
		filters={"is_active": 1},
		order_by="valid_to asc",
		limit=3,
	)


def get_public_stats():
	product_count = frappe.db.count("Product", {"is_active": 1, "available_for_website": 1})
	category_count = frappe.db.count("Product Category", {"is_active": 1})
	custom_count = frappe.db.count("Custom Cake Request") if frappe.db.exists("DocType", "Custom Cake Request") else 0

	return [
		{"label": "Menu Items", "value": product_count},
		{"label": "Cake Categories", "value": category_count},
		{"label": "Custom Requests", "value": custom_count},
	]


def money(value):
	return frappe.format_value(flt(value), {"fieldtype": "Currency", "options": "INR"})
