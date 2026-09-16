# Copyright (c) 2026, Ziya Fazal and Contributors
# See license.txt

import frappe
from frappe.tests import IntegrationTestCase
from sugar_rush_bakes.sugar_rush_bakes.doctype.customer_order.customer_order import get_coupon_discount


class IntegrationTestCoupon(IntegrationTestCase):
	def test_coupon_discount_calculation(self):
		coupon = frappe.get_doc({
			"doctype": "Coupon",
			"coupon_code": "TEST10",
			"discount_type": "Percentage",
			"discount_percentage": 10,
			"maximum_discount_amount": 100,
			"is_active": 1,
			"valid_from": frappe.utils.today(),
			"valid_to": frappe.utils.add_days(frappe.utils.today(), 10)
		})
		coupon.insert()

		res = get_coupon_discount("TEST10", 500)
		self.assertEqual(res["discount"], 50.0)

		coupon.delete()
