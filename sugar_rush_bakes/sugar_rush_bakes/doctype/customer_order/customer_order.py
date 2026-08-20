# Copyright (c) 2026, Sugar Rush Bakes and contributors
# For license information, please see license.txt

import frappe
from frappe.model.document import Document

class CustomerOrder(Document):
	
    def validate(self):
        self.calculate_totals()
        self.grand_total = (
			flt(self.subtotal)
			- flt(self.discount_amount)
			+ flt(self.delivery_charge)
			+ flt(self.tax_amount)
		)

    def calculate_totals(self):
        subtotal = 0

        for item in self.items:
            qty = item.qty or 0
            unit_price = item.unit_price or 0

            item.line_total = qty * unit_price
            subtotal += item.line_total

        self.subtotal = subtotal

@frappe.whitelist()
def get_valid_coupons(doctype, txt, searchfield, start, page_len, filters):

    subtotal = filters.get("subtotal") or 0

    return frappe.db.sql("""
        SELECT name
        FROM `tabCoupon`
        WHERE is_active = 1
          AND valid_from <= CURDATE()
          AND valid_to >= CURDATE()
          AND minimum_order_amount <= %s
          AND name LIKE %s
        LIMIT %s, %s
    """, (subtotal, "%" + txt + "%", start, page_len))

@frappe.whitelist()
def get_coupon_discount(coupon_code, subtotal):

    coupon = frappe.get_doc("Coupon", coupon_code)

    # ✅ convert subtotal safely
    subtotal = float(subtotal or 0)

    discount = 0

    if coupon.discount_type == "Fixed Amount":
        discount = float(coupon.discount_value or 0)

    elif coupon.discount_type == "Percentage":
        discount = (subtotal * float(coupon.discount_percentage or 0)) / 100

    # optional cap
    if coupon.maximum_discount_amount:
        discount = min(discount, float(coupon.maximum_discount_amount))

    return {
        "discount": discount,
        "discount_type": coupon.discount_type
    }