import json
import re

import frappe
from frappe.utils import now_datetime
from twilio.base.exceptions import TwilioRestException
from twilio.rest import Client


# A conservative E.164 check: optional leading '+', then 8-15 digits.
E164_PATTERN = re.compile(r"^\+?[1-9]\d{7,14}$")


class WhatsAppService:
    """Handles outbound WhatsApp messaging via Twilio, with logging
    to the 'WhatsApp Message Log' doctype."""

    def __init__(self):
        self.settings = frappe.get_single("Bakery Settings")

        if not self.settings.enable_whatsapp:
            frappe.throw("WhatsApp integration is disabled in Bakery Settings.")

        if self.settings.whatsapp_provider != "Twilio":
            frappe.throw(
                f"Unsupported WhatsApp provider: {self.settings.whatsapp_provider}"
            )

        self.account_sid = self.settings.twilio_account_sid
        self.auth_token = self.settings.get_password("twilio_auth_token")
        self.from_number = self.settings.twilio_whatsapp_number

        if not self.account_sid:
            frappe.throw("Twilio Account SID is missing in Bakery Settings.")

        if not self.auth_token:
            frappe.throw("Twilio Auth Token is missing in Bakery Settings.")

        if not self.from_number:
            frappe.throw("Twilio WhatsApp Number is missing in Bakery Settings.")

        self.client = Client(self.account_sid, self.auth_token)

    # =====================================================
    # NORMALIZE + VALIDATE PHONE NUMBER
    # =====================================================

    def normalize_phone_number(self, phone_number):
        if not phone_number:
            frappe.throw("WhatsApp recipient phone number is required.")

        phone_number = str(phone_number).strip()

        # Strip whatsapp: prefix if the caller already included it,
        # so validation runs against the raw number either way.
        if phone_number.startswith("whatsapp:"):
            phone_number = phone_number[len("whatsapp:"):]

        # Remove spaces, hyphens, and brackets.
        phone_number = re.sub(r"[\s\-()]", "", phone_number)

        if not E164_PATTERN.match(phone_number):
            frappe.throw(
                f"'{phone_number}' is not a valid phone number. "
                "Use E.164 format, e.g. +919876543210."
            )

        return f"whatsapp:{phone_number}"

    # =====================================================
    # CREATE MESSAGE LOG
    # =====================================================

    def create_message_log(
        self,
        phone_number,
        message,
        message_type="Manual Message",
        customer=None,
        customer_order=None,
        custom_cake_request=None,
        template_name=None,
        triggered_by="System",
        trigger_source=None,
    ):
        log = frappe.new_doc("WhatsApp Message Log")

        log.mobile_number = phone_number
        log.message_type = message_type
        log.provider = "Twilio"
        log.triggered_by = triggered_by
        log.message_content = message
        log.status = "Queued"
        log.retry_count = 0

        if customer:
            log.customer = customer

        if customer_order:
            log.customer_order = customer_order

        if custom_cake_request:
            log.custom_cake_request = custom_cake_request

        if template_name:
            log.template_name = template_name

        if trigger_source:
            log.trigger_source = trigger_source

        log.insert(ignore_permissions=True)

        return log

    # =====================================================
    # SEND WHATSAPP MESSAGE
    # =====================================================

    def send_message(
        self,
        phone_number,
        message,
        message_type="Manual Message",
        customer=None,
        customer_order=None,
        custom_cake_request=None,
        template_name=None,
        triggered_by="System",
        trigger_source=None,
    ):
        phone_number = self.normalize_phone_number(phone_number)

        log = self.create_message_log(
            phone_number=phone_number,
            message=message,
            message_type=message_type,
            customer=customer,
            customer_order=customer_order,
            custom_cake_request=custom_cake_request,
            template_name=template_name,
            triggered_by=triggered_by,
            trigger_source=trigger_source,
        )

        try:
            response = self.client.messages.create(
                from_=self.from_number,
                body=message,
                to=phone_number,
            )

        except TwilioRestException as e:
            # Twilio-specific errors carry a machine-readable code
            # (e.g. 63016 = outside session window, 21211 = invalid
            # 'To' number) which is far more useful than str(e) alone.
            self._mark_failed(
                log,
                error_message=e.msg,
                provider_response={
                    "code": e.code,
                    "status": e.status,
                    "msg": e.msg,
                    "more_info": e.uri,
                },
                log_title="Twilio WhatsApp Message Failed",
            )
            return {
                "success": False,
                "message_log": log.name,
                "provider": "Twilio",
                "status": "Failed",
                "error_code": e.code,
                "error": e.msg,
            }

        except Exception as e:
            # Anything else: network failure, auth misconfiguration, etc.
            self._mark_failed(
                log,
                error_message=str(e),
                provider_response={"error": str(e)},
                log_title="WhatsApp Message Failed (Unexpected Error)",
            )
            return {
                "success": False,
                "message_log": log.name,
                "provider": "Twilio",
                "status": "Failed",
                "error": str(e),
            }

        self._mark_sent(log, response)

        return {
            "success": True,
            "message_log": log.name,
            "provider": "Twilio",
            "provider_message_id": response.sid,
            "status": response.status,
        }

    # =====================================================
    # LOG UPDATE HELPERS
    # =====================================================

    def _mark_sent(self, log, response):
        provider_response = {
            "sid": response.sid,
            "status": response.status,
            "direction": getattr(response, "direction", None),
            "price": getattr(response, "price", None),
            "price_unit": getattr(response, "price_unit", None),
        }

        log.provider_message_id = response.sid
        log.status = "Sent"
        log.sent_on = now_datetime()
        log.provider_response = json.dumps(provider_response, default=str, indent=2)

        log.save(ignore_permissions=True)
        frappe.db.commit()

    def _mark_failed(self, log, error_message, provider_response, log_title):
        log.status = "Failed"
        log.failed_on = now_datetime()
        log.failure_reason = error_message
        log.provider_response = json.dumps(provider_response, default=str, indent=2)

        log.save(ignore_permissions=True)
        frappe.db.commit()

        frappe.log_error(title=log_title, message=frappe.get_traceback())