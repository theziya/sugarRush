import frappe

from sugar_rush_bakes.sugar_rush_bakes.services.whatsapp_service import (
    WhatsAppService
)


@frappe.whitelist()
def send_test_message(
    phone,
    message=None
):

    if not message:

        message = (
            "Hello from Sugar Rush Bakes! "
            "This is a test WhatsApp message."
        )

    service = WhatsAppService()

    response = service.send_message(
        phone_number=phone,
        message=message
    )

    return response