# Copyright (c) 2026, Sugar Rush Bakes and contributors
# For license information, please see license.txt

import frappe
from frappe.model.document import Document
from frappe.utils import flt

class CustomerOrder(Document):
	
    def validate(self):
        if flt(self.subtotal) < 0:
            frappe.throw("Subtotal cannot be negative")
        if flt(self.discount_amount) < 0:
            frappe.throw("Discount amount cannot be negative")
        if flt(self.delivery_charge) < 0:
            frappe.throw("Delivery charge cannot be negative")
        if flt(self.tax_amount) < 0:
            frappe.throw("Tax amount cannot be negative")
        if flt(self.amount_paid) < 0:
            frappe.throw("Amount paid cannot be negative")

        self.ensure_srb_customer()
        self.link_product_to_items()
        self.sync_payments_child_table()
        self.save_payment_proof_image()
        self.calculate_totals()
        self.grand_total = max(
			0.0,
			flt(self.subtotal)
			- flt(self.discount_amount)
			+ flt(self.delivery_charge)
			+ flt(self.tax_amount)
		)

        if flt(self.amount_paid) > flt(self.grand_total) and self.payment_status not in ["Paid", "Overpaid", "Needs Verification"]:
            self.payment_status = "Paid"

        self.balance_amount = max(0.0, flt(self.grand_total) - flt(self.amount_paid))

    def sync_payments_child_table(self):
        # Calculate total amount_paid from payments child table if entries exist
        if hasattr(self, "payments") and self.payments:
            total_child_paid = sum(flt(p.amount) for p in self.payments if p.payment_status in ["Paid", "Needs Verification", "Partially Paid"])
            if total_child_paid > 0:
                self.amount_paid = total_child_paid

        # If upi_transaction_id or payment_proof_image provided at top-level but payments table is empty, auto-populate child entry
        if (self.upi_transaction_id or self.payment_proof_image or flt(self.amount_paid) > 0) and not self.payments:
            self.append("payments", {
                "payment_method": self.payment_method or "UPI",
                "amount": flt(self.amount_paid) or flt(self.grand_total),
                "payment_date": self.delivery_date or frappe.utils.today(),
                "payment_status": self.payment_status or "Needs Verification",
                "utr_number": self.upi_transaction_id or "",
                "payment_proof_image": self.payment_proof_image or "",
                "notes": getattr(self, "customer_notes", "") or "Auto-recorded payment"
            })

    def save_payment_proof_image(self):
        # 1. Main doc attachment
        if hasattr(self, "payment_proof_image") and self.payment_proof_image and self.payment_proof_image.startswith("data:image"):
            try:
                import base64
                from frappe.utils.file_manager import save_file
                header, encoded = self.payment_proof_image.split(",", 1)
                file_bytes = base64.b64decode(encoded)
                fname = f"payment_proof_{self.name or 'temp'}.png"
                saved_file = save_file(fname, file_bytes, self.doctype, self.name, is_private=0)
                self.payment_proof_image = saved_file.file_url
            except Exception as e:
                frappe.log_error(f"Error saving payment proof image: {str(e)}")

        # 2. Save child table base64 images as attachments
        if hasattr(self, "payments"):
            for idx, p in enumerate(self.payments):
                if p.payment_proof_image and p.payment_proof_image.startswith("data:image"):
                    try:
                        import base64
                        from frappe.utils.file_manager import save_file
                        header, encoded = p.payment_proof_image.split(",", 1)
                        file_bytes = base64.b64decode(encoded)
                        fname = f"payment_proof_{self.name or 'temp'}_p{idx+1}.png"
                        saved_file = save_file(fname, file_bytes, self.doctype, self.name, is_private=0)
                        p.payment_proof_image = saved_file.file_url
                    except Exception as e:
                        frappe.log_error(f"Error saving child payment proof image: {str(e)}")

    def ensure_srb_customer(self):
        if not self.mobile_number:
            return

        # 1. Find or create SRB Customer document
        cust_name = frappe.db.get_value("SRB Customer", {"mobile_number": self.mobile_number}, "name")
        if not cust_name:
            cust_name = frappe.db.get_value("SRB Customer", {"customer_name": self.customer_name}, "name")

        if not cust_name:
            new_cust = frappe.get_doc({
                "doctype": "SRB Customer",
                "customer_name": self.customer_name,
                "mobile_number": self.mobile_number,
                "email": self.email,
                "is_active": 1
            })
            new_cust.flags.ignore_permissions = True
            new_cust.insert()
            cust_name = new_cust.name
        else:
            # Update email or name if provided
            cust_doc = frappe.get_doc("SRB Customer", cust_name)
            if self.email and not cust_doc.email:
                cust_doc.email = self.email
                cust_doc.flags.ignore_permissions = True
                cust_doc.save()

        # Link customer to order
        self.customer = cust_name

        # 2. Auto-create Customer Address if address is provided
        if self.address:
            addr_exists = frappe.db.exists("Customer Address", {
                "customer": cust_name,
                "address_line_1": self.address
            })
            if not addr_exists:
                new_addr = frappe.get_doc({
                    "doctype": "Customer Address",
                    "customer": cust_name,
                    "address_title": f"{self.customer_name} - Home",
                    "address_line_1": self.address,
                    "city": "Chennai",
                    "pincode": self.pincode or "600001",
                    "is_default": 1
                })
                new_addr.flags.ignore_permissions = True
                new_addr.insert()

    def link_product_to_items(self):
        for item in self.items:
            if not item.product and item.product_name:
                prod_data = frappe.db.get_value(
                    "Product",
                    {"product_name": item.product_name},
                    ["name", "category"],
                    as_dict=True
                )
                if prod_data:
                    item.product = prod_data.name
                    if not item.product_category and prod_data.category:
                        item.product_category = prod_data.category

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

@frappe.whitelist(allow_guest=True)
def get_customer_by_query(query):
    if not query or len(str(query).strip()) < 2:
        return None

    query = str(query).strip()
    
    # 1. Search by exact or partial customer name or mobile number
    customer = frappe.db.get_value(
        "SRB Customer",
        {"customer_name": ["like", f"%{query}%"]},
        ["name", "customer_name", "mobile_number", "email"],
        as_dict=True
    )

    if not customer:
        customer = frappe.db.get_value(
            "SRB Customer",
            {"mobile_number": ["like", f"%{query}%"]},
            ["name", "customer_name", "mobile_number", "email"],
            as_dict=True
        )

    if not customer:
        return None

    # 2. Fetch default or last saved address for this customer
    address = frappe.db.get_value(
        "Customer Address",
        {"customer": customer.name},
        ["address_line_1", "pincode"],
        order_by="is_default desc, creation desc",
        as_dict=True
    )

    if address:
        customer["address"] = address.address_line_1
        customer["pincode"] = address.pincode
    else:
        customer["address"] = ""
        customer["pincode"] = ""

    return customer

@frappe.whitelist(allow_guest=True)
def create_customer(customer_name, mobile_number, email=None, address=None, pincode=None):
    if not customer_name or not customer_name.strip():
        frappe.throw("Customer Name is required.")
    if not mobile_number or not mobile_number.strip():
        frappe.throw("Mobile Number is required.")
    
    customer_name = customer_name.strip()
    mobile_number = mobile_number.strip()

    # Check duplicate mobile number or name
    existing_by_mobile = frappe.db.get_value("SRB Customer", {"mobile_number": mobile_number}, "name")
    existing_by_name = frappe.db.get_value("SRB Customer", {"customer_name": customer_name}, "name")

    if existing_by_mobile:
        cust_doc = frappe.get_doc("SRB Customer", existing_by_mobile)
        cust_doc.customer_name = customer_name
        if email: cust_doc.email = email
        cust_doc.flags.ignore_permissions = True
        cust_doc.save()
    elif existing_by_name:
        cust_doc = frappe.get_doc("SRB Customer", existing_by_name)
        cust_doc.mobile_number = mobile_number
        if email: cust_doc.email = email
        cust_doc.flags.ignore_permissions = True
        cust_doc.save()
    else:
        cust_doc = frappe.get_doc({
            "doctype": "SRB Customer",
            "customer_name": customer_name,
            "mobile_number": mobile_number,
            "email": email or "",
            "is_active": 1
        })
        cust_doc.flags.ignore_permissions = True
        cust_doc.insert()

    if address:
        addr_name = frappe.db.exists("Customer Address", {
            "customer": cust_doc.name,
            "address_line_1": address
        })
        if not addr_name:
            new_addr = frappe.get_doc({
                "doctype": "Customer Address",
                "customer": cust_doc.name,
                "address_title": f"{customer_name} - Home",
                "address_line_1": address,
                "city": "Chennai",
                "pincode": pincode or "600001",
                "is_default": 1
            })
            new_addr.flags.ignore_permissions = True
            new_addr.insert()

    return {
        "name": cust_doc.name,
        "customer_name": cust_doc.customer_name,
        "mobile_number": cust_doc.mobile_number,
        "email": cust_doc.email,
        "address": address or "",
        "pincode": pincode or ""
    }

@frappe.whitelist(allow_guest=True)
def extract_utr_from_image(image_data=None):
    """
    Extract 12-digit UTR/Transaction ID from uploaded payment screenshot.
    Performs regex matching for 12-digit numbers across raw text & OCR output.
    """
    import re
    import re as regex

    found_utrs = []

    if image_data:
        try:
            import base64
            # Handle base64 data URL
            if "," in image_data:
                header, encoded = image_data.split(",", 1)
            else:
                encoded = image_data
            
            decoded_bytes = base64.b64decode(encoded)

            # Try Tesseract OCR if pytesseract is installed
            try:
                import pytesseract
                from PIL import Image
                import io
                
                img = Image.open(io.BytesIO(decoded_bytes))
                ocr_text = pytesseract.image_to_string(img)
                matches = re.findall(r'\b\d{12}\b', ocr_text)
                for m in matches:
                    if m not in found_utrs:
                        found_utrs.append(m)
            except Exception:
                pass

            # Fallback regex search on raw binary string patterns if OCR lib not present
            text_str = str(decoded_bytes)
            matches = re.findall(r'\b\d{12}\b', text_str)
            for m in matches:
                if m not in found_utrs:
                    found_utrs.append(m)
        except Exception as e:
            frappe.log_error(f"UTR Extraction Error: {str(e)}")

    return {
        "success": True,
        "utrs": found_utrs,
        "extracted_utr": found_utrs[0] if found_utrs else None
    }