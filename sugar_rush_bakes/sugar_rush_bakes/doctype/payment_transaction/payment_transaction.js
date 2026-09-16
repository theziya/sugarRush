// Copyright (c) 2026, Sugar Rush Bakes and contributors
// For license information, please see license.txt

frappe.ui.form.on("Payment Transaction", {
	customer_order(frm) {
		if (!frm.doc.customer_order) {
			frm.set_value("customer", "");
			return;
		}

		frappe.db.get_value("Customer Order", frm.doc.customer_order, "customer").then((r) => {
			const customer = r && r.message ? r.message.customer : "";
			frm.set_value("customer", customer || "");
		});
	}
});
