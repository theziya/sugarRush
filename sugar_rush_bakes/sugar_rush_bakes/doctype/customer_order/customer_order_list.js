frappe.listview_settings['Customer Order'] = {
    add_fields: ["payment_status", "order_status", "grand_total"],
    get_indicator: function(doc) {
        if (doc.payment_status === "Paid") {
            return [__("Paid"), "green", "payment_status,=,Paid"];
        } else if (doc.payment_status === "Needs Verification") {
            return [__("Needs Verification"), "orange", "payment_status,=,Needs Verification"];
        } else if (doc.payment_status === "Pending") {
            return [__("Pending"), "yellow", "payment_status,=,Pending"];
        } else if (doc.payment_status === "Failed" || doc.payment_status === "Rejected") {
            return [__(doc.payment_status), "red", "payment_status,=," + doc.payment_status];
        } else if (doc.payment_status === "Partially Paid") {
            return [__("Partially Paid"), "blue", "payment_status,=,Partially Paid"];
        } else {
            return [__(doc.payment_status || "Pending"), "gray", "payment_status,=," + doc.payment_status];
        }
    }
};
