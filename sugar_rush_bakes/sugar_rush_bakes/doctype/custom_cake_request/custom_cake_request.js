// Copyright (c) 2026, Sugar Rush Bakes and contributors
// For license information, please see license.txt

frappe.ui.form.on("Custom Cake Request", {
	refresh(frm) {
		if (!frm.is_new() && !frm.doc.customer_order) {
			frm.add_custom_button(__("Convert to Order"), () => {
				frappe.call({
					method: "sugar_rush_bakes.sugar_rush_bakes.doctype.custom_cake_request.custom_cake_request.convert_to_order",
					args: {
						custom_cake_request: frm.doc.name
					},
					callback(r) {
						if (!r.message) {
							return;
						}

						frm.reload_doc();
						frappe.set_route("Form", "Customer Order", r.message);
					}
				});
			});
		}
	},

	customer(frm) {
		if (!frm.doc.customer) {
			return;
		}

		frappe.db
			.get_value("SRB Customer", frm.doc.customer, ["customer_name", "mobile_number", "email"])
			.then((r) => {
				const customer = r && r.message ? r.message : {};

				if (customer.customer_name) {
					frm.set_value("customer_name", customer.customer_name);
				}

				if (customer.mobile_number) {
					frm.set_value("mobile_number", customer.mobile_number);
				}

				if (customer.email) {
					frm.set_value("email", customer.email);
				}
			});
	}
});
