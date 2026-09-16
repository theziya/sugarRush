// Copyright (c) 2026, Sugar Rush Bakes and contributors
// For license information, please see license.txt

frappe.ui.form.on("Customer Order", {
    refresh(frm) {
        if (!frm.is_new() && frm.doc.payment_status !== "Paid") {
            frm.add_custom_button(__("Mark as Paid 💳"), function() {
                frappe.confirm(
                    `Record payment of ₹${frm.doc.grand_total} as Paid?`,
                    function() {
                        frm.set_value("amount_paid", frm.doc.grand_total);
                        frm.set_value("payment_status", "Paid");
                        frm.save().then(() => {
                            frappe.show_alert({
                                message: __("Order payment updated to Paid!"),
                                indicator: "green"
                            });
                        });
                    }
                );
            }).addClass("btn-primary");
        }
    },

    setup(frm) {
        frm.set_query("product", "items", function() {
            return {
                filters: {
                    is_active: 1
                }
            };
        });
		frm.set_query("coupon_code", function () {
			return {
				query: "sugar_rush_bakes.sugar_rush_bakes.doctype.customer_order.customer_order.get_valid_coupons",
				filters: {
					subtotal: frm.doc.subtotal || 0
				}
			};
		});
    },

    customer: function(frm) {
        if (frm.doc.customer) {
            frappe.db.get_doc("SRB Customer", frm.doc.customer)
                .then(doc => {
                    frm.set_value("customer_name", doc.customer_name);
                    frm.set_value("email", doc.email);
                    frm.set_value("mobile_number", doc.mobile_number);
                });
        } else {
            frm.set_value("customer_name", "");
            frm.set_value("email", "");
            frm.set_value("mobile_number", "");
        }
    },

	coupon_code(frm) {
        if (!frm.doc.coupon_code || !frm.doc.subtotal) return;

        frappe.call({
            method: "sugar_rush_bakes.sugar_rush_bakes.doctype.customer_order.customer_order.get_coupon_discount",
            args: {
                coupon_code: frm.doc.coupon_code,
                subtotal: frm.doc.subtotal
            },
            callback: function (r) {
                if (r.message) {
                    frm.set_value("coupon_discount", r.message.discount);
					frm.set_value("discount_amount", r.message.discount);
                }
            }
        });
	},

	subtotal: function(frm) {
        calculate_grand_total(frm);
    },
    discount_amount: function(frm) {
        calculate_grand_total(frm);
    },
    delivery_charge: function(frm) {
        calculate_grand_total(frm);
    },
    tax_amount: function(frm) {
        calculate_grand_total(frm);
    }
	
});


// CHILD TABLE SCRIPT
frappe.ui.form.on("Customer Order Item", {

    product(frm, cdt, cdn) {
        let row = locals[cdt][cdn];

        if (row.product) {
            frappe.db.get_doc("Product", row.product)
                .then(doc => {

                    frappe.model.set_value(cdt, cdn, "product_name", doc.product_name);
                    frappe.model.set_value(cdt, cdn, "product_category", doc.category);

                    if (doc.show_price) {
                        frappe.model.set_value(cdt, cdn, "unit_price", doc.base_price);
                    } else {
                        frappe.model.set_value(cdt, cdn, "unit_price", 0);
                    }
					calculate_totals(frm);

                });
        } else {
            frappe.model.set_value(cdt, cdn, "product_name", "");
            frappe.model.set_value(cdt, cdn, "product_category", "");
            frappe.model.set_value(cdt, cdn, "unit_price", 0);
			frappe.model.set_value(cdt, cdn, "line_total", 0);
			calculate_totals(frm);
        }
    },
	qty(frm) {
        calculate_totals(frm);
    },

    unit_price(frm) {
        calculate_totals(frm);
    },

    items_add(frm) {
        calculate_totals(frm);
    },

    items_remove(frm) {
        calculate_totals(frm);
    }
});

// Common Function
function calculate_totals(frm) {

    let subtotal = 0;

    (frm.doc.items || []).forEach(function (row) {

        row.line_total = flt(row.qty) * flt(row.unit_price);

        subtotal += flt(row.line_total);
    });

    frm.refresh_field("items");

    frm.set_value("subtotal", subtotal);
}

function calculate_grand_total(frm) {
    let subtotal = flt(frm.doc.subtotal);
    let discount = flt(frm.doc.discount_amount);
    let delivery = flt(frm.doc.delivery_charge);
    let tax = flt(frm.doc.tax_amount);

    let grand_total = subtotal - discount + delivery + tax;

    frm.set_value("grand_total", grand_total);
}

