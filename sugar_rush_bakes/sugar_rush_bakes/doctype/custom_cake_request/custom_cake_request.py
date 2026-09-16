# Copyright (c) 2026, Sugar Rush Bakes and contributors
# For license information, please see license.txt

import math

import frappe
from frappe import _
from frappe.model.document import Document
from frappe.utils import cint, date_diff, today


class CustomCakeRequest(Document):
	def validate(self):
		self.validate_delivery_address()
		self.validate_min_advance()
		self.validate_conversion()
		self.validate_quote()
		self.warn_for_rejection_reason()

	def validate_delivery_address(self):
		if self.delivery_type != "Delivery":
			return

		if self.address or self.pincode or self.address_line_1:
			return

		frappe.throw(_("Pincode, Address, or Address Line 1 is required for delivery requests."))

	def validate_min_advance(self):
		if not self.delivery_date:
			return

		min_advance_hours = cint(
			frappe.db.get_single_value("Bakery Settings", "default_min_advance_hours")
		)
		if not min_advance_hours:
			min_advance_hours = 24

		min_advance_days = int(math.ceil(min_advance_hours / 24))
		if date_diff(self.delivery_date, today()) < min_advance_days:
			frappe.throw(
				_("Delivery Date must be at least {0} hour(s) from today.").format(
					min_advance_hours
				)
			)

	def validate_conversion(self):
		if self.status == "Converted to Order" and not self.customer_order:
			frappe.throw(_("Customer Order is required when status is Converted to Order."))

	def validate_quote(self):
		if (self.quote_shared_on or self.quote_shared_via) and not self.quoted_price:
			frappe.throw(_("Quoted Price is required when a quote has been shared."))

	def warn_for_rejection_reason(self):
		if self.status == "Rejected" and not self.rejection_reason:
			frappe.msgprint(_("Rejection Reason is recommended for rejected requests."))


@frappe.whitelist()
def convert_to_order(custom_cake_request):
	request = frappe.get_doc("Custom Cake Request", custom_cake_request)

	if request.customer_order:
		return request.customer_order

	if not request.quoted_price:
		frappe.throw(_("Quoted Price is required before converting to order."))

	order_amount = request.quoted_price
	address = "\n".join(
		filter(
			None,
			[
				request.address_line_1,
				request.address_line_2,
				request.landmark,
				request.city,
				request.state,
			],
		)
	)
	if not address:
		address = request.address

	order = frappe.get_doc(
		{
			"doctype": "Customer Order",
			"customer": request.customer,
			"customer_name": request.customer_name,
			"mobile_number": request.mobile_number,
			"email": request.email,
			"order_source": request.source,
			"order_type": "Custom Cake",
			"delivery_type": request.delivery_type,
			"delivery_date": request.delivery_date,
			"delivery_slot": request.delivery_slot,
			"address": address,
			"pincode": request.pincode,
			"subtotal": order_amount,
			"discount_amount": 0,
			"delivery_charge": 0,
			"tax_amount": 0,
			"grand_total": order_amount,
			"advance_amount_required": request.advance_amount_required,
			"amount_paid": 0,
			"balance_amount": order_amount,
			"payment_status": "Pending",
			"order_status": "Placed",
			"customer_notes": request.special_instructions,
			"internal_notes": request.admin_remarks,
			"items": [
				{
					"product_name": request.design_name or "Custom Cake",
					"qty": 1,
					"unit_price": order_amount,
					"line_total": order_amount,
					"weight_option": request.weight_requirement,
					"flavour_option": request.flavour,
					"egg_type": request.egg_type,
					"message_on_cake": request.message_on_cake,
					"special_instructions": request.special_instructions,
				}
			],
		}
	)
	order.insert()

	frappe.db.set_value(
		"Custom Cake Request",
		request.name,
		{
			"converted_to_order": 1,
			"customer_order": order.name,
			"converted_on": frappe.utils.now_datetime(),
			"converted_by": frappe.session.user,
			"status": "Converted to Order",
		},
	)

	return order.name
