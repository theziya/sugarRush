// Copyright (c) 2026, Sugar Rush Bakes and contributors
// For license information, please see license.txt

frappe.ui.form.on("WhatsApp Message Log", {
	customer_order(frm) {
		if (!frm.doc.customer_order) {
			return;
		}

		frappe.db
			.get_value("Customer Order", frm.doc.customer_order, ["customer", "mobile_number"])
			.then((r) => {
				const order = r && r.message ? r.message : {};

				if (order.customer) {
					frm.set_value("customer", order.customer);
				}

				if (order.mobile_number) {
					frm.set_value("mobile_number", order.mobile_number);
				}
			});
	}
});
