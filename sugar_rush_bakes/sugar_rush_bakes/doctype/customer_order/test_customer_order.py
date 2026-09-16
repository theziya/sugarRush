# Copyright (c) 2026, Ziya Fazal and Contributors
# See license.txt

import frappe
from frappe.tests import IntegrationTestCase


class IntegrationTestCustomerOrder(IntegrationTestCase):
	def test_order_calculation(self):
		order = frappe.get_doc({
			"doctype": "Customer Order",
			"customer_name": "Test Customer",
			"mobile_number": "9876543210",
			"order_source": "Website",
			"order_type": "Standard",
			"delivery_type": "Pickup",
			"delivery_date": frappe.utils.add_days(frappe.utils.today(), 2),
			"order_status": "Draft",
			"payment_status": "Pending",
			"items": [
				{
					"product_name": "Chocolate Cake",
					"qty": 2,
					"unit_price": 500
				},
				{
					"product_name": "Cupcake",
					"qty": 4,
					"unit_price": 50
				}
			],
			"discount_amount": 100,
			"delivery_charge": 50,
			"tax_amount": 25,
			"amount_paid": 200
		})
		order.insert()

		self.assertEqual(order.subtotal, 1200)
		self.assertEqual(order.grand_total, 1175)
		self.assertEqual(order.balance_amount, 975)

		order.delete()
